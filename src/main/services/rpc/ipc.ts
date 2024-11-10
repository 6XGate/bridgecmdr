import { callProcedure, getDataTransformer, getTRPCErrorFromUnknown, TRPCError } from '@trpc/server'
import { isObservable } from '@trpc/server/observable'
import { getErrorShape, transformTRPCResponse } from '@trpc/server/shared'
import { ipcMain } from 'electron'
import Logger from 'electron-log'
import type { MaybePromise } from '@/basics'
import type { CreateContextOptions } from '@/rpc/ipc'
import type { AnyRouter, inferRouterContext } from '@trpc/server'
import type { Unsubscribable } from '@trpc/server/observable'
import type { TRPCClientOutgoingMessage, TRPCResponseMessage } from '@trpc/server/rpc'
import type { BrowserWindow, IpcMainEvent } from 'electron'
import { theRpcChannel } from '@/rpc/ipc'

interface CreateIpcHandlerOptions<Router extends AnyRouter> {
  router: Router
  createContext?: (opts: CreateContextOptions) => MaybePromise<inferRouterContext<Router>>
  windows?: BrowserWindow[]
}

/**
 * Creates a tRPC handler using the Electron IPC.
 *
 * This handler is modelled after the web-socket handler in tRPC.
 *
 * @param options - Handler options
 * @returns Return a tRPC handler for Electron IPC.
 */
export function createIpcHandler<Router extends AnyRouter>(options: CreateIpcHandlerOptions<Router>) {
  const windows = new Set<BrowserWindow>()
  const subscriptions = new Map<string, Unsubscribable>()
  const { router, createContext } = options
  const config = router._def._config

  const transformer = getDataTransformer(config.transformer as never)

  function getSubscriptionId(id: number, frameId: number | undefined) {
    return frameId != null ? `${id}-${frameId}` : `${id}-`
  }

  function cleanUpSubscriptions(id: number, frameId?: number) {
    const removing = new Set<string>()
    for (const [key, subscription] of subscriptions) {
      if (key.startsWith(getSubscriptionId(id, frameId))) {
        subscription.unsubscribe()
        removing.add(key)
      }
    }
    for (const key of removing) {
      subscriptions.delete(key)
    }
  }

  function setupSubscriptionCleanup(window: BrowserWindow) {
    window.webContents.on('did-start-navigation', (event) => {
      cleanUpSubscriptions(window.webContents.id, event.frame.routingId)
    })
    window.webContents.on('destroyed', () => {
      detachWindow(window)
    })
  }

  function attachWindow(window: BrowserWindow) {
    if (windows.has(window)) return

    windows.add(window)
    setupSubscriptionCleanup(window)
  }

  function detachWindow(window: BrowserWindow) {
    if (!windows.has(window)) return

    windows.delete(window)
    cleanUpSubscriptions(window.webContents.id)
  }

  function unsubscribe(id: string) {
    const subscription = subscriptions.get(id)
    if (subscription == null) return

    subscription.unsubscribe()
    subscriptions.delete(id)
  }

  async function handleMessage(event: IpcMainEvent, msg: TRPCClientOutgoingMessage) {
    if (msg.id == null) {
      throw new TRPCError({ code: 'BAD_REQUEST', message: '`id` is required' })
    }

    const { id, jsonrpc = '2.0' } = msg
    const subscriptionId = `${event.sender.id}-${event.senderFrame.routingId}:${id}`
    function respond(response: TRPCResponseMessage) {
      if (event.sender.isDestroyed()) return
      const rpcResponse = transformTRPCResponse(config, response)
      event.reply(theRpcChannel, rpcResponse)
    }

    function stopSubscription() {
      unsubscribe(subscriptionId)
      respond({ id, jsonrpc, result: { type: 'stopped' } })
    }

    if (msg.method === 'subscription.stop') {
      stopSubscription()
      return
    }

    const path = msg.params.path
    const input = transformer.input.deserialize(msg.params.input) as unknown
    const type = msg.method
    const ctx = (await createContext?.({ event })) ?? {}

    try {
      const result = await callProcedure({
        procedures: router._def.procedures as never,
        path,
        rawInput: input,
        ctx,
        type
      })

      if (type !== 'subscription') {
        respond({ id, jsonrpc, result: { type: 'data', data: result } })
        return
      } else if (!isObservable(result)) {
        throw new TRPCError({
          message: `Subscription ${path} did not return an observable`,
          code: 'INTERNAL_SERVER_ERROR'
        })
      }

      const observable = result
      const sub = observable.subscribe({
        next(data) {
          respond({ id, jsonrpc, result: { type: 'data', data } })
        },
        error(err) {
          const error = getTRPCErrorFromUnknown(err)
          respond({ id, jsonrpc, error: getErrorShape({ config, error, type, path, input, ctx }) as never })
        },
        complete() {
          respond({ id, jsonrpc, result: { type: 'stopped' } })
        }
      })

      if (subscriptions.has(subscriptionId)) {
        stopSubscription()
        throw new TRPCError({ message: `Duplicate id ${id}`, code: 'BAD_REQUEST' })
      }

      subscriptions.set(subscriptionId, sub)

      respond({ id, jsonrpc, result: { type: 'started' } })
    } catch (err) {
      const error = getTRPCErrorFromUnknown(err)
      respond({ id, jsonrpc, error: getErrorShape({ config, error, type, path, input, ctx }) as never })
    }
  }

  // Initialization

  for (const window of options.windows ?? []) {
    attachWindow(window)
  }

  ipcMain.on(theRpcChannel, (event, message: TRPCClientOutgoingMessage) => {
    handleMessage(event, message).catch((err: unknown) => {
      Logger.error('Fatal error in IPC', err, message)
      throw err
    })
  })

  return {
    attachWindow,
    detachWindow
  }
}
