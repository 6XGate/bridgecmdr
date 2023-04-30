import is from '@sindresorhus/is'
import { toValue } from '@vueuse/shared'
import { computed } from 'vue'
import { useDialogs } from '@/modals/dialogs'
import type { MaybeRefOrGetter } from '@vueuse/shared'

export const tap = <T> (value: T, fn: (param: T) => unknown) => {
  fn(value)

  return value
}

export const forceUndefined = <T> () => undefined as T

export const useGuardedAsyncOp = (fn: () => Promise<unknown>) => {
  const dialogs = useDialogs()

  return () => {
    fn().catch(async e => {
      await dialogs.error(e)
    })
  }
}

export const useButton = (
  propValue: MaybeRefOrGetter<string | boolean | undefined>,
  defaultText: MaybeRefOrGetter<string>
) =>
  computed(() => {
    const value = toValue(propValue)

    if (value === true || value === '') {
      return toValue(defaultText)
    }

    if (is.nonEmptyString(value)) {
      return value
    }

    return undefined
  })

type ForEachReturn = boolean | null | undefined

type AsyncForEachCallback<T extends object>
  = T extends ReadonlyMap<infer K, infer V> ? (item: V, key: K, target: T) => Promise<ForEachReturn>
    : T extends ReadonlySet<infer V> ? (item: V, key: V, target: T) => Promise<ForEachReturn>
      : T extends Map<infer K, infer V> ? (item: V, key: K, target: T) => Promise<ForEachReturn>
        : T extends Set<infer V> ? (item: V, key: V, target: T) => Promise<ForEachReturn>
          : T extends Array<infer V> ? (item: V, index: number, target: T) => Promise<ForEachReturn>
            : T extends Record<infer K, infer V> ? (item: V, key: K, target: T) => Promise<ForEachReturn>
              : (item: T[keyof T], key: keyof T, target: T) => Promise<ForEachReturn>

type IterableIteratorFor<T extends object>
  = T extends ReadonlyMap<infer K, infer V> ? ReturnType<ReadonlyMap<K, V>['entries']>
    : T extends ReadonlySet<infer V> ? ReturnType<ReadonlySet<V>['entries']>
      : T extends Map<infer K, infer V> ? ReturnType<Map<K, V>['entries']>
        : T extends Set<infer V> ? ReturnType<Set<V>['entries']>
          : T extends Array<infer V> ? ReturnType<V[]['entries']>
            : T extends Record<infer K, infer V> ? IterableIterator<[K, V]>
              : IterableIterator<[keyof T, T[keyof T]]>

export async function asyncForEach<T extends object> (target: T, fn: AsyncForEachCallback<T>) {
  if ('entries' in target) {
    for (const [key, item] of (target.entries as () => IterableIteratorFor<T>)()) {
      const go = (await fn(item, key, target)) ?? true
      if (!go) {
        return
      }
    }
  } else {
    for (const [key, item] of Object.entries(target)) {
      const go = (await fn(item as never, key as never, target)) ?? true
      if (!go) {
        return
      }
    }
  }
}
