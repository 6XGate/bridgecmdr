import { initTRPC } from '@trpc/server'
import useSuperJson from '@/rpc'

const t = initTRPC.create({
  transformer: useSuperJson()
})

export const { router, procedure, createCallerFactory } = t
