import { map } from 'radash'
import { z } from 'zod'
import { defineDatabase, DocumentId, getInsertable, getUpdateable } from '../services/database'
import type { getDocument } from '../services/database'

export type Tie = getDocument<typeof Tie>
export const Tie = z.object({
  sourceId: DocumentId,
  switchId: DocumentId,
  inputChannel: z.number().int().nonnegative(),
  outputChannels: z.object({
    video: z.number().int().nonnegative().optional(),
    audio: z.number().int().nonnegative().optional()
  })
})

const useTiesDatabase = defineDatabase({
  name: 'ties',
  schema: Tie,
  indices: [{ sourceId: ['sourceId'], switchId: ['switchId'] }],
  setup: (base) => ({
    forSwitch: base.defineOperation(
      async (db, switchId: DocumentId) =>
        await db.find({ selector: { switchId } }).then(async (r) => await map(r.docs, base.prepare))
    ),
    forSource: base.defineOperation(
      async (db, sourceId: DocumentId) =>
        await db.find({ selector: { sourceId } }).then(async (r) => await map(r.docs, base.prepare))
    )
  })
})

export type NewTie = getInsertable<typeof Tie>
export const NewTie = getInsertable(Tie)
export type TieUpdate = getUpdateable<typeof Tie>
export const TieUpdate = getUpdateable(Tie)

export default useTiesDatabase
