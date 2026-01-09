import { memo } from 'radash'
import { useSettingsRepository } from '../repos/settings'
import { useLevelDb } from '../services/level'
import type { Promisable } from 'type-fest'

class StorageDao {
  private readonly settings = useSettingsRepository()

  async getItem(key: string): Promise<string | null> {
    return await this.settings.getSetting(key)
  }

  async setItem(key: string, value: string): Promise<void> {
    await this.settings.setSetting(key, value)
  }

  async removeItem(key: string): Promise<void> {
    await this.settings.removeSetting(key)
  }

  async clear(): Promise<void> {
    await this.settings.clearSettings()
  }
}

export const useStorageDao = memo(() => new StorageDao())

const useUserStore = memo(function useUserStore() {
  const { levelup } = useLevelDb()

  const booted = levelup('_userStorage')

  function defineOperation<Args extends unknown[], Result>(
    op: (db: Awaited<typeof booted>, ...args: Args) => Promisable<Result>
  ) {
    return async (...args: Args) => await op(await booted, ...args)
  }

  const getItem = defineOperation(async function getItem(db, key: string) {
    try {
      return await db.get(key, { asBuffer: false })
    } catch {
      return null
    }
  })

  const setItem = defineOperation(async function setItem(db, key: string, value: string) {
    await db.put(key, value)
  })

  const removeItem = defineOperation(async function removeItem(db, key: string) {
    await db.del(key)
  })

  const clear = defineOperation(async function clear(db) {
    await db.clear()
  })

  return {
    getItem,
    setItem,
    removeItem,
    clear
  }
})

export default useUserStore
