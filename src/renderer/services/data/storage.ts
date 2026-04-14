import { useStorageAsync } from '@vueuse/core'
import { memo } from 'radash'
import { useClient } from '../rpc/trpc'
import type { RemovableRef, UseStorageAsyncOptions } from '@vueuse/core'
import type { MaybeRefOrGetter } from 'vue'

// To make this work well, we will require async methods.
class StorageLikeAsync {
  private readonly client = useClient()

  async getItem(key: string): Promise<string | null> {
    return await this.client.storage.getItem.query(key)
  }

  async setItem(key: string, value: string): Promise<void> {
    await this.client.storage.setItem.mutate([key, value])
  }

  async removeItem(key: string): Promise<void> {
    await this.client.storage.removeItem.mutate(key)
  }

  async clear(): Promise<void> {
    await this.client.storage.clear.mutate()
  }
}

export const useUserStore = memo(() => new StorageLikeAsync())

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
