import { defineStore } from 'pinia'
import { z } from 'zod'
import { defineDatabase, DocumentId } from '@/data/database'
import { useDataSet } from '@/data/set'
import { useDataStore } from '@/data/store'
import { forceUndefined } from '@/helpers/utilities'
import { useTies, useTiesDatabase } from '@/system/tie'
import { trackBusy } from '@/utilities/tracking'
import type { DocumentOf } from '@/data/database'

export type NewSwitch = z.input<typeof Switch>
export type Switch = DocumentOf<typeof Switch>
export const Switch = z.object({
  driverId: DocumentId,
  title: z.string().min(1),
  path: z.string().min(1)
})

export const useSwitchesDatabase = defineDatabase('switches', Switch)

export const useSwitches = defineStore('switches', () => {
  const tracker = trackBusy()
  const db = useSwitchesDatabase()
  const set = useDataSet(Switch)
  const store = useDataStore(db, set, tracker)

  const blank = (): NewSwitch => ({
    driverId: forceUndefined(),
    title: forceUndefined(),
    path: 'port:'
  })

  const tiesDb = useTiesDatabase()
  const ties = useTies()

  const remove = tracker.track(async (...[id, ...args]: Parameters<typeof db.remove>) => {
    await db.remove(id, ...args)
    set.deleteItem(id)

    const related = await tiesDb
      .query(async backend => await backend.find({ selector: { switchId: id } }))
      .then(r => r.docs)

    await Promise.all(related.map(async tie => { await ties.remove(tie._id) }))
  })

  return {
    ...store,
    compact: tracker.track(db.compact),
    remove,
    blank
  }
})
