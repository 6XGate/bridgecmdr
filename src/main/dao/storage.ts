import { memo } from 'radash'
import { useLevelDb } from '../services/level'

export type UserStore = ReturnType<typeof useUserStore>
const useUserStore = memo(function useUserStore() {
  const { levelup } = useLevelDb()

  const booted = levelup('_userStorage')

  function defineOperation<Args extends unknown[], Result>(
    op: (db: Awaited<typeof booted>, ...args: Args) => Promise<Result>
  ) {
    return async (...args: Args) => await op(await booted, ...args)
  }

  const getItem = defineOperation(async function getItem(db, key: string) {
    try {
      return (await db.get(key, { asBuffer: false })) as string
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
