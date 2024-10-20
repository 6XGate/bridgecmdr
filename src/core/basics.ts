import { range } from 'radash'

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
 * Wait a specified amount of time.
 * @param timeout - The amount of time to wait in milliseconds.
 */
export async function waitTill(timeout: number) {
  await new Promise<void>((resolve) => {
    setTimeout(resolve, timeout)
  })
}

/**
 * Provides an iterator for a specified number of iterations.
 * @param iterations - Number of iterations.
 * @returns Generator that will yield the number of iterations.
 */
export const generate = (iterations: number) => range(iterations - 1)
