import { useStorageAsync } from '@vueuse/core'
import { useLevelDb } from './level'
import type { MaybeRefOrGetter, UseStorageAsyncOptions, RemovableRef } from '@vueuse/core'

// To make this work well, we will require async methods.
export interface StorageLikeAsync {
  getItem: (key: string) => Promise<string | null>
  setItem: (key: string, value: string) => Promise<void>
  removeItem: (key: string) => Promise<void>
}

export interface AsyncStorageEventInitDict {
  /** Returns the key of the storage item being changed. */
  readonly key: string | null
  /** Returns the new value of the key of the storage item whose value is being changed. */
  readonly newValue: string | null
  /** Returns the old value of the key of the storage item whose value is being changed. */
  readonly oldValue: string | null
  /** Returns the StorageLikeAsync object that was affected. */
  readonly storageArea: StorageLikeAsync | null
}

function emit(data: AsyncStorageEventInitDict) {
  const event = new StorageEvent('storage', {
    ...data,
    // Need to force the type.
    storageArea: null, // data.storageArea as never,
    url: '<user>',
    bubbles: false,
    cancelable: false,
    composed: false
  })

  globalThis.dispatchEvent(event)
}

export function defineAsyncStorage<T extends StorageLikeAsync>(setup: () => T) {
  const storageArea = setup()

  return () => ({
    ...storageArea,
    setItem: async (key: string, newValue: string) => {
      const oldValue = await storageArea.getItem(key)
      await storageArea.setItem(key, newValue)
      emit({ key, newValue, oldValue, storageArea })
    },
    removeItem: async (key: string) => {
      const oldValue = await storageArea.getItem(key)
      await storageArea.removeItem(key)
      emit({ key, newValue: null, oldValue, storageArea })
    }
  })
}

export const createUserStorage = defineAsyncStorage(function createUserStorage() {
  const { levelup } = useLevelDb()

  const dbPromise = levelup('_userStorage')

  async function getItem(key: string) {
    const db = await dbPromise

    try {
      return (await db.get(key, { asBuffer: false })) as string
    } catch {
      return null
    }
  }

  async function setItem(key: string, value: string) {
    const db = await dbPromise

    await db.put(key, value)
  }

  async function removeItem(key: string) {
    const db = await dbPromise

    await db.del(key)
  }

  async function clear() {
    const db = await dbPromise

    await db.clear()
  }

  return {
    getItem,
    setItem,
    removeItem,
    clear
  }
})

export function useUserStorage(
  key: string,
  initialValue: MaybeRefOrGetter<boolean>,
  options?: UseStorageAsyncOptions<boolean>
): RemovableRef<boolean>
export function useUserStorage(
  key: string,
  initialValue: MaybeRefOrGetter<number>,
  options?: UseStorageAsyncOptions<number>
): RemovableRef<number>
export function useUserStorage(
  key: string,
  initialValue: MaybeRefOrGetter<string>,
  options?: UseStorageAsyncOptions<string>
): RemovableRef<string>
export function useUserStorage<T>(
  key: string,
  initialValue: MaybeRefOrGetter<T>,
  options?: UseStorageAsyncOptions<T>
): RemovableRef<T>

export function useUserStorage<T = unknown>(
  key: string,
  initialValue: MaybeRefOrGetter<null>,
  options?: UseStorageAsyncOptions<T>
): RemovableRef<T>

export function useUserStorage<T extends string | number | boolean | object | null>(
  key: string,
  initialValue: MaybeRefOrGetter<T>,
  options: UseStorageAsyncOptions<T> = {}
): RemovableRef<unknown> {
  return useStorageAsync(key, initialValue, globalThis.userStorage, options)
}

declare global {
  // eslint-disable-next-line no-var -- Required to augment globalThis
  var userStorage: ReturnType<typeof createUserStorage>
}

export const createPersistentStores = () => ({
  install: () => {
    globalThis.userStorage = createUserStorage()
  }
})
