import { randomBytes } from 'crypto'
import { initTRPC, TRPCError } from '@trpc/server'
import { memo } from 'radash'
import type { CreateHTTPContextOptions } from '@trpc/server/adapters/standalone'
import type { CreateWSSContextFnOptions } from '@trpc/server/adapters/ws'
import type { TRPC_ERROR_CODE_KEY } from '@trpc/server/rpc'
import useSuperJson from '@/rpc'

export type Context = Awaited<ReturnType<typeof createContext>>

function createContext(path: string | null) {
  if (path == null) return { auth: undefined }
  const url = new URL(`ws://127.0.0.1${path}`)
  const auth = url.searchParams.get('auth') ?? undefined

  return { auth }
}

export function createStandaloneContext(opts: CreateHTTPContextOptions | CreateWSSContextFnOptions) {
  return createContext(opts.req.url ?? null)
}

const t = initTRPC.context<Context>().create({
  transformer: useSuperJson()
})

export const getAuthToken = memo(function getAuthToken() {
  return randomBytes(16).toString('base64url')
})

function error(code: TRPC_ERROR_CODE_KEY, message?: string, cause?: unknown): never {
  throw new TRPCError({
    code,
    ...(message ? { message } : {}),
    ...(cause != null ? { cause } : {})
  })
}

export const { router, createCallerFactory } = t
export const procedure = t.procedure.use(async function checkAuth(opts) {
  const { ctx } = opts
  const { auth } = ctx

  if (auth == null) error('UNAUTHORIZED')
  if (auth !== getAuthToken()) error('UNAUTHORIZED')

  return await opts.next()
})
