import is from '@sindresorhus/is'
import type { MergeDeep, UnknownRecord } from 'type-fest'

export function mergeLocaleParts<First extends UnknownRecord, Next extends UnknownRecord>(first: First, next: Next) {
  const output: UnknownRecord = { ...first, ...next }
  for (const [key, value] of Object.entries(first)) {
    const now = output[key]
    if (is.object(value) && is.object(now)) {
      output[key] = mergeLocaleParts(value as UnknownRecord, now as UnknownRecord)
    } else if (is.array(value) && is.array(now)) {
      output[key] = now
    }
  }

  return output as MergeDeep<First, Next>
}
