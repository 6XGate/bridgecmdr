import { createTRPCProxyClient, httpLink } from '@trpc/client'
import { memo } from 'radash'
import type { AppRouter } from '../../preload/api'
import useSuperJson from '@/rpc'

export const useClient = memo(() =>
  createTRPCProxyClient<AppRouter>({
    transformer: useSuperJson(),
    links: [httpLink({ url: globalThis.configuration.rpcUrl })]
  })
)
