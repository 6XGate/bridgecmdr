import { toObjectPath } from './basics'
import type { IsAny } from 'type-fest'
import type { z } from 'zod'

export function getZodMessage(e: z.ZodError) {
  const flattened = e.flatten((issue) =>
    issue.path.length > 0 ? `${toObjectPath(issue.path)}: ${issue.message}` : issue.message
  )

  return (
    flattened.formErrors[0] ??
    // Map all fields to their first error, and find the first that has an error.
    Object.values(flattened.fieldErrors)
      .map((errors) => errors?.[0])
      .find((error) => error != null)
  )
}

export function getMessage(cause: unknown) {
  if (cause instanceof Error) return cause.message
  if (cause == null) return `BadError: ${cause}`
  if (typeof cause === 'string') return cause
  if (typeof cause !== 'object') return String(cause as never)
  if (!('message' in cause)) return `BadError: ${Object.prototype.toString.call(cause)}`
  if (typeof cause.message !== 'string') return String(cause.message)
  return cause.message
}

export type AsError<T> = IsAny<T> extends true ? Error : T extends Error ? T : Error

export function toError<Cause>(cause: Cause): AsError<Cause>
export function toError(cause: unknown) {
  if (cause instanceof Error) return cause
  return new Error(getMessage(cause))
}

export function raiseError(factory: () => Error): never {
  throw factory()
}

export function warnPromiseFailures<T>(msg: string, results: PromiseSettledResult<T>[]) {
  for (const result of results) {
    if (result.status === 'rejected') {
      console.warn(msg, result.reason)
    }
  }
}

export function logPromiseFailures<T>(msg: string, results: PromiseSettledResult<T>[]) {
  for (const result of results) {
    if (result.status === 'rejected') {
      console.error(msg, result.reason)
    }
  }
}
