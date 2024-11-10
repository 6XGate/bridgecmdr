import { initTRPC } from '@trpc/server'
import useSuperJson from '@/rpc/transformer'

const t = initTRPC.create({ transformer: useSuperJson() })

export const { router, procedure } = t
