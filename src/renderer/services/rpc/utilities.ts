import type { TRPCClientRuntime } from '@trpc/client'
import type { AnyRouter, inferRouterContext, inferRouterError } from '@trpc/server'
import type { TRPCResponse, TRPCResponseMessage } from '@trpc/server/rpc'

export function transformResults<Router extends AnyRouter, Output>(
  response: TRPCResponseMessage<Output, inferRouterContext<Router>> | TRPCResponse<Output, inferRouterContext<Router>>,
  runtime: TRPCClientRuntime
) {
  if ('error' in response) {
    const error = runtime.transformer.deserialize(response.error) as inferRouterError<Router>
    return { ok: false, error: { ...response, error } } as const
  }

  const result =
    !response.result.type || response.result.type === 'data'
      ? {
          ...response.result,
          type: 'data' as const,
          data: runtime.transformer.deserialize(response.result.data) as Output
        }
      : { ...response.result }
  return { ok: true, result } as const
}
