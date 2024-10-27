import { defineStore } from 'pinia'
import { nextTick } from 'vue'
import { z } from 'zod'
import { defineDatabase, DocumentId } from '../data/database'
import { useDataSet } from '../data/set'
import { useDataStore } from '../data/store'
import { forceUndefined } from '../helpers/utilities'
import { trackBusy } from '../utilities/tracking'
import type { DocumentOf } from '../data/database'

export type NewTie = z.input<typeof Tie>
export type Tie = DocumentOf<typeof Tie>
export const Tie = z.object({
  sourceId: DocumentId,
  switchId: DocumentId,
  inputChannel: z.number().int(),
  outputChannels: z.object({
    video: z.number().int().optional(),
    audio: z.number().int().optional()
  })
})

export const useTiesDatabase = defineDatabase('ties', Tie, {
  sourceId: ['sourceId'],
  switchId: ['switchId']
})

export const useTies = defineStore('ties', function defineTies() {
  const tracker = trackBusy()
  const db = useTiesDatabase()
  const set = useDataSet(Tie)
  const store = useDataStore(db, set, tracker)

  function blank(): NewTie {
    return {
      sourceId: forceUndefined(),
      switchId: forceUndefined(),
      inputChannel: forceUndefined(),
      outputChannels: {
        video: undefined,
        audio: undefined
      }
    }
  }

  const forSwitch = tracker.track(async function forSwitch(id: DocumentId) {
    // Clear the list before load.
    set.initialize([])

    await nextTick()
    set.initialize(
      await db.query(async (backend) => await backend.find({ selector: { switchId: id } }).then((r) => r.docs))
    )
  })

  const forSource = tracker.track(async function forSource(id: DocumentId) {
    // Clear the list before load.
    set.initialize([])

    await nextTick()
    set.initialize(
      await db.query(async (backend) => await backend.find({ selector: { sourceId: id } }).then((r) => r.docs))
    )
  })

  return {
    ...store,
    compact: tracker.track(db.compact),
    blank,
    forSwitch,
    forSource
  }
})
