import { initTRPC } from '@trpc/server'
import { useIpcJson } from '@/rpc/transformer'

const t = initTRPC.create({ transformer: useIpcJson() })

export const { router, procedure } = t
