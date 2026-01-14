import { createTRPCProxyClient } from '@trpc/client'
import { memo } from 'radash'
import { useIpcLink } from './link'
import type { AppRouter } from '../../../preload/api'
import { useIpcJson } from '@/rpc/transformer'

export const useClient = memo(() =>
  createTRPCProxyClient<AppRouter>({ transformer: useIpcJson(), links: [useIpcLink()] })
)
