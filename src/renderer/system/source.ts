import { defineStore } from 'pinia'
import { z } from 'zod'
import { defineDatabase } from '../data/database'
import { useDataSet } from '../data/set'
import { useDataStore } from '../data/store'
import { forceUndefined } from '../helpers/utilities'
import { trackBusy } from '../utilities/tracking'
import { useTies, useTiesDatabase } from './tie'
import type { DocumentOf } from '../data/database'

export type NewSource = z.input<typeof Source>
export type Source = DocumentOf<typeof Source>
export const Source = z.object({
  title: z.string().min(1),
  image: z.string().min(1).nullable()
})

export const useSourcesDatabase = defineDatabase('sources', Source)

export const useSources = defineStore('sources', () => {
  const tracker = trackBusy()
  const db = useSourcesDatabase()
  const set = useDataSet(Source)
  const store = useDataStore(db, set, tracker)

  const blank = (): NewSource => ({
    title: forceUndefined(),
    image: null
  })

  const tiesDb = useTiesDatabase()
  const ties = useTies()

  const remove = tracker.track(async (...[id, ...args]: Parameters<typeof db.remove>) => {
    await db.remove(id, ...args)
    set.deleteItem(id)

    const related = await tiesDb
      .query(async backend => await backend.find({ selector: { sourceId: id } }))
      .then(r => r.docs)

    await Promise.all(
      related.map(async tie => {
        await ties.remove(tie._id)
      })
    )
  })

  return {
    ...store,
    compact: tracker.track(db.compact),
    remove,
    blank
  }
})
