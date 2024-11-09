import { z } from 'zod'
import { defineDatabase, DocumentId, getInsertable, getUpdateable } from '../services/database'
import useTiesDatabase from './ties'
import type { getDocument } from '../services/database'

export type Switch = getDocument<typeof Switch>
export const Switch = z.object({
  driverId: DocumentId,
  title: z.string().min(1),
  path: z.string().min(1)
})

export const useSwitchesDatabase = defineDatabase({
  name: 'switches',
  schema: Switch,
  setup: (base) => {
    const ties = useTiesDatabase()

    return {
      remove: async (id: DocumentId) => {
        await base.remove(id)

        const related = await ties.forSwitch(id)
        await Promise.all(
          related.map(async ({ _id }) => {
            await ties.remove(_id)
          })
        )
      }
    }
  }
})

export type NewSwitch = getInsertable<typeof Switch>
export const NewSwitch = getInsertable(Switch)
export type SwitchUpdate = getUpdateable<typeof Switch>
export const SwitchUpdate = getUpdateable(Switch)
