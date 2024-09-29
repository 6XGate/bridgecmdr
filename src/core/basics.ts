export type Fixed<T = unknown> = [T, ...T[]]

export type MaybePromise<T> = Promise<T> | T

/** Guards and filter to not nullish */
export const isNotNullish = <T>(value: T | null | undefined): value is T => value != null

export function toArray<T>(value: T): T extends unknown[] ? T : T[] {
  if (value == null) {
    return [] as never
  }

  return (Array.isArray(value) ? value : [value]) as never
}
