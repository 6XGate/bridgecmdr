import { createTRPCProxyClient } from '@trpc/client'
import { createGlobalState } from '@vueuse/shared'
import { useIpcLink } from './link'
import type { AppRouter } from '../../../preload/api'
import useSuperJson from '@/rpc/transformer'

export const useClient = createGlobalState(function useClient() {
  return createTRPCProxyClient<AppRouter>({ transformer: useSuperJson(), links: [useIpcLink()] })
})
