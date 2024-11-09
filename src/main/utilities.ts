import Logger from 'electron-log'

export function logError<E extends Error>(e: E) {
  Logger.error(e)
  return e
}

export function isNodeError(value: unknown): value is NodeJS.ErrnoException
export function isNodeError<E extends new (...args: any[]) => Error>(
  value: unknown,
  type: E
): value is InstanceType<E> & NodeJS.ErrnoException
export function isNodeError(value: unknown, type: new (...args: any[]) => Error = Error) {
  return value instanceof type && (value as NodeJS.ErrnoException).code != null
}
