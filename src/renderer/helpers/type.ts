/** Utility type that allows anything that is satisfied to become a tuple without the use of `as const`. */
export type TupleLike = [unknown, ...unknown[]]

export function toArray<T> (value: T): T extends unknown[] ? T : T[] {
  if (value == null) {
    return [] as never
  }

  return (Array.isArray(value) ? value : [value]) as never
}
