import { computed, nextTick } from 'vue'
import type { Database } from '@/data/database'
import type { DataSet } from '@/data/set'
import type { Tracker } from '@/utilities/tracking'
import type { z } from 'zod'

export const useDataStore = <Schema extends z.AnyZodObject> (db: Database<Schema>, set: DataSet<Schema>, tracker: Tracker) => {
  const all = tracker.track(async () => {
    // Clear the list before load.
    set.initialize([])

    await nextTick()
    set.initialize(await db.all())
  })

  const get = tracker.track(async (...args: Parameters<typeof db.get>) => {
    const doc = await db.get(...args)
    set.current.value = doc

    return doc
  })

  const add = tracker.track(async (...args: Parameters<typeof db.add>) => {
    const newDoc = await db.add(...args)
    set.insertItem(newDoc)

    return newDoc
  })

  const update = tracker.track(async (...args: Parameters<typeof db.update>) => {
    const newDoc = await db.update(...args)
    set.replaceItem(newDoc)

    return newDoc
  })

  const remove = tracker.track(async (...[id, ...args]: Parameters<typeof db.remove>) => {
    await db.remove(id, ...args)
    set.deleteItem(id)
  })

  const dismiss = () => {
    set.current.value = undefined
  }

  const clear = set.clearItems

  return {
    isBusy: tracker.isBusy,
    error: tracker.error,
    items: set.items,
    current: computed(() => set.current.value),
    get,
    all,
    add,
    update,
    remove,
    dismiss,
    clear
  }
}
