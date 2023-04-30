import type { MergeDeep, WritableDeep } from 'type-fest'

export function isObject (value: unknown): value is object {
  if (value == null) {
    return false
  }

  if (typeof value !== 'object') {
    return false
  }

  return !Array.isArray(value)
}

type AnyObject = Record<string, unknown>

export function deepAssign<First extends AnyObject, Next extends AnyObject> (first: First, next: Next) {
  const output: AnyObject = { ...first, ...next }
  for (const [key, value] of Object.entries(first)) {
    const now = output[key]
    if (isObject(value) && isObject(now)) {
      output[key] = deepAssign(value as AnyObject, now as AnyObject)
    }
  }

  return output as MergeDeep<First, Next>
}

export function deepClone<T extends AnyObject> (target: T) {
  const output: AnyObject = { ...target }
  for (const [key, value] of Object.entries(target)) {
    if (value != null && typeof value === 'object') {
      output[key] = deepClone(value as AnyObject)
    }
  }

  return output as WritableDeep<T>
}
