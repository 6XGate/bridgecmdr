export type ToError<E> = E extends Error ? E : Error

export function toError<Cause>(cause: Cause) {
  if (cause instanceof Error) return cause as ToError<Cause>
  return new Error(String(cause)) as ToError<Cause>
}

export function raiseError(factory: () => Error): never {
  throw factory()
}
