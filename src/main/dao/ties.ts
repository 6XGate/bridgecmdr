import { map, memo } from 'radash'
import { z } from 'zod'
import { Database, DocumentId, inferDocumentOf, inferNewDocumentOf, inferUpdatesOf } from '../services/database'

export const TieModel = z.object({
  sourceId: DocumentId,
  switchId: DocumentId,
  inputChannel: z.number().int().nonnegative(),
  outputChannels: z.object({
    video: z.number().int().nonnegative().optional(),
    audio: z.number().int().nonnegative().optional()
  })
})

const indices = { sourceId: ['sourceId'], switchId: ['switchId'] }

const useTiesDatabase = memo(
  () =>
    new (class extends Database.of('ties', TieModel, indices) {
      async forSwitch(switchId: DocumentId) {
        return await this.run(
          async (db) =>
            await db
              .find({ selector: { switchId } })
              .then(async (r) => await map(r.docs, async (d) => await this.prepare(d)))
        )
      }

      async forSource(sourceId: DocumentId) {
        return await this.run(
          async (db) =>
            await db
              .find({ selector: { sourceId } })
              .then(async (r) => await map(r.docs, async (d) => await this.prepare(d)))
        )
      }
    })()
)

export type Tie = inferDocumentOf<typeof TieModel>
export const Tie = inferDocumentOf(TieModel)
export type NewTie = inferNewDocumentOf<typeof TieModel>
export const NewTie = inferNewDocumentOf(TieModel)
export type TieUpdate = inferUpdatesOf<typeof TieModel>
export const TieUpdate = inferUpdatesOf(TieModel)

export default useTiesDatabase
