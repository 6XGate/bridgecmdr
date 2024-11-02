import { createTRPCProxyClient, createWSClient, httpLink, wsLink } from '@trpc/client'
import { createGlobalState } from '@vueuse/shared'
import type { AppRouter } from '../../preload/api'
import useSuperJson from '@/rpc'
import { getServerUrl } from '@/url'

export const useClient = createGlobalState(function useClient() {
  function useHttpClient() {
    return createTRPCProxyClient<AppRouter>({
      transformer: useSuperJson(),
      links: [httpLink({ url: globalThis.configuration.rpcUrl })]
    })
  }

  function useWsClient() {
    const client = createWSClient({ url: globalThis.configuration.rpcUrl })
    return createTRPCProxyClient<AppRouter>({
      transformer: useSuperJson(),
      links: [wsLink({ client })]
    })
  }

  const url = new URL(globalThis.configuration.rpcUrl)
  const [, , protocol] = getServerUrl(url, 7180)

  return protocol === 'http:' ? useHttpClient() : useWsClient()
})
