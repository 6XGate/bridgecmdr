import type { z } from 'zod'

export type ToError<E> = E extends Error ? E : Error

const toPath = (path: (number | string)[]) =>
  path
    .map((segment) => (typeof segment === 'number' ? `[${segment}]` : segment))
    .reduce((p, c) => (c.startsWith('[') ? `${p}${c}` : `${p}.${c}`))

export function getZodMessage(e: z.ZodError) {
  const flattened = e.flatten((issue) =>
    issue.path.length > 0 ? `${toPath(issue.path)}: ${issue.message}` : issue.message
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
  if (typeof cause !== 'object') return String(cause)
  if (!('message' in cause)) return `BadError: ${Object.prototype.toString.call(cause)}`
  if (typeof cause.message !== 'string') return String(cause.message)
  return cause.message
}

export function toError<Cause>(cause: Cause) {
  if (cause instanceof Error) return cause as ToError<Cause>
  return new Error(String(cause)) as ToError<Cause>
}

export function raiseError(factory: () => Error): never {
  throw factory()
}
