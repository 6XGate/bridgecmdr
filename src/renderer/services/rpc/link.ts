import { TRPCClientError } from '@trpc/client'
import { observable } from '@trpc/server/observable'
import { transformResults } from './utilities'
import type { Operation, TRPCLink } from '@trpc/client'
import type { AnyRouter, inferRouterContext, ProcedureType } from '@trpc/server'
import type { Observer } from '@trpc/server/observable'
import type { TRPCClientIncomingRequest, TRPCRequestMessage, TRPCResponseMessage } from '@trpc/server/rpc'

type CallbackResult<Router extends AnyRouter, Output = unknown> = TRPCResponseMessage<
  Output,
  inferRouterContext<Router>
>

type CallbackObserver<Router extends AnyRouter, Output = unknown> = Observer<
  CallbackResult<Router, Output>,
  TRPCClientError<Router>
>

interface Request<Router extends AnyRouter, Output = unknown> {
  type: ProcedureType
  callbacks: CallbackObserver<Router, Output>
  op: Operation
}

export function useIpcLink<Router extends AnyRouter>(): TRPCLink<Router> {
  const pendingRequests = new Map<string | number, Request<Router>>()
  const rpc = globalThis.rpc

  function handleIncomingRequest(_req: TRPCClientIncomingRequest) {
    console.debug('handleIncomingRequest is unnecessary')
  }

  function handleIncomingResponse(data: TRPCResponseMessage) {
    const req = data.id != null ? pendingRequests.get(data.id) : null
    if (req == null) return

    req.callbacks.next(data)
    if ('result' in data && data.result.type === 'stopped') {
      req.callbacks.complete()
    }
  }

  rpc.onMessage(function handleMessage(msg) {
    if ('method' in msg) {
      handleIncomingRequest(msg)
    } else {
      handleIncomingResponse(msg)
    }
  })

  function request(op: Operation, callbacks: CallbackObserver<Router>) {
    const { type, input, path, id } = op
    const envelope = { id, method: type, params: { input, path } } satisfies TRPCRequestMessage
    pendingRequests.set(id, { type, callbacks, op })

    rpc.sendMessage(envelope)

    return () => {
      const cbs = pendingRequests.get(id)?.callbacks
      pendingRequests.delete(id)

      cbs?.complete()
      if (type === 'subscription') {
        rpc.sendMessage({ id, method: 'subscription.stop' })
      }
    }
  }

  return function ipcLink(runtime) {
    return function ipcProcess({ op }) {
      return observable(function ipcObserve(observer) {
        const { type, path, id, context } = op
        const input = runtime.transformer.serialize(op.input) as unknown

        const unsubscribe = request(
          { type, path, input, id, context },
          {
            error(err) {
              observer.error(err)
              unsubscribe()
            },
            complete() {
              observer.complete()
            },
            next(response) {
              const transformed = transformResults(response, runtime)
              if (!transformed.ok) {
                observer.error(TRPCClientError.from(transformed.error))
                return
              }

              observer.next({ result: transformed.result })
              if (op.type !== 'subscription') {
                unsubscribe()
                observer.complete()
              }
            }
          }
        )

        return unsubscribe
      })
    }
  }
}
