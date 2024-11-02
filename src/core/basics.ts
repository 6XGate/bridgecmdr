/** Provides a means to define a tuple via satisfies. */
export type Fixed<T = unknown> = [T, ...T[]]

/** Could be a promise. */
export type MaybePromise<T> = Promise<T> | T

/** Guards and filter to not nullish */
export const isNotNullish = <T>(value: T | null | undefined): value is T => value != null

/** Wraps a non-array value in an array, or simply passes an array through. */
export function toArray<T>(value: T): T extends unknown[] ? T : T[] {
  if (value == null) {
    return [] as never
  }

  return (Array.isArray(value) ? value : [value]) as never
}

/**
 * Creates a new promise with externally accessible fulfillment operations.
 *
 * This is a polyfill for
 * [Promise.withResolver](https://developer.mozilla.org/Web/JavaScript/Reference/Global_Objects/Promise/withResolvers).
 *
 * @returns An object with a Promise and its fulfillment operations.
 */
export function withResolvers<T>() {
  let resolve: (value: T | PromiseLike<T>) => void = () => undefined
  let reject: (reason?: unknown) => void = () => undefined

  const promise = new Promise<T>((_resolve, _reject) => {
    resolve = _resolve
    reject = _reject
  })

  return { resolve, reject, promise }
}

/**
 * Run an operation asynchronously as a microtask.
 * @param op - The operation to run as a micro-task.
 * @returns The result of the operation.
 */
export async function asMicrotask<Result>(op: () => MaybePromise<Result>) {
  return await new Promise<Result>((resolve, reject) => {
    queueMicrotask(() => {
      try {
        // eslint-disable-next-line @typescript-eslint/use-unknown-in-catch-callback-variable -- Proxied
        Promise.resolve(op()).then(resolve).catch(reject)
      } catch (cause) {
        // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors -- Proxied
        reject(cause)
      }
    })
  })
}
