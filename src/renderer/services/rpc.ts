import { createTRPCProxyClient, createWSClient, wsLink } from '@trpc/client'
import { createGlobalState } from '@vueuse/shared'
import type { AppRouter } from '../../preload/api'
import useSuperJson from '@/rpc'

export const useClient = createGlobalState(function useClient() {
  // TODO: May be needed for the remove server one day.
  // function useHttpClient() {
  //   return createTRPCProxyClient<AppRouter>({
  //     transformer: useSuperJson(),
  //     links: [httpLink({ url: rpcUrl })]
  //   })
  // }

  function useWsClient() {
    const location = new URL(globalThis.location.href)
    const port = Number(location.searchParams.get('port'))
    if (Number.isNaN(port)) throw new ReferenceError('No RPC port available')

    const auth = location.searchParams.get('auth')
    if (!auth) throw new ReferenceError('No auth token available')

    const url = `ws://127.0.0.1:${port}/?auth=${auth}`
    console.log(`Connecting to RPC server at ${url}`)
    const client = createWSClient({ url })
    return createTRPCProxyClient<AppRouter>({
      transformer: useSuperJson(),
      links: [wsLink({ client })]
    })
  }

  return useWsClient()
})
