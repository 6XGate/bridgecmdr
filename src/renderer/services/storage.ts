import { createSharedComposable, useStorageAsync } from '@vueuse/core'
import { useClient } from './rpc'
import type { RemovableRef, UseStorageAsyncOptions } from '@vueuse/core'
import type { MaybeRefOrGetter } from 'vue'

// To make this work well, we will require async methods.
export interface StorageLikeAsync {
  getItem: (key: string) => Promise<string | null>
  setItem: (key: string, value: string) => Promise<void>
  removeItem: (key: string) => Promise<void>
}

interface AsyncStorageEventInitDict {
  /** Returns the key of the storage item being changed. */
  readonly key: string | null
  /** Returns the new value of the key of the storage item whose value is being changed. */
  readonly newValue: string | null
  /** Returns the old value of the key of the storage item whose value is being changed. */
  readonly oldValue: string | null
  /** Returns the StorageLikeAsync object that was affected. */
  readonly storageArea: StorageLikeAsync | null
}

const useUserStore = createSharedComposable(function useUserStore() {
  const client = useClient()

  function emit(data: AsyncStorageEventInitDict) {
    const event = new StorageEvent('storage', {
      ...data,
      storageArea: null,
      url: '<user>',
      bubbles: false,
      cancelable: false,
      composed: false
    })

    globalThis.dispatchEvent(event)
  }

  async function getItem(key: string) {
    return await client.storage.getItem.query(key)
  }

  async function setItem(key: string, newValue: string) {
    const oldValue = await client.storage.getItem.query(key)
    await client.storage.setItem.mutate([key, newValue])
    emit({ key, newValue, oldValue, storageArea })
  }

  async function removeItem(key: string) {
    const oldValue = await client.storage.getItem.query(key)
    await client.storage.removeItem.mutate(key)
    emit({ key, newValue: null, oldValue, storageArea })
  }

  async function clear() {
    await client.storage.clear.mutate()
  }

  const storageArea = {
    getItem,
    setItem,
    removeItem,
    clear
  }

  return storageArea
})

export default useUserStore

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
  return useStorageAsync(key, initialValue, useUserStore(), options)
}
