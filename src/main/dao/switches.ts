import { memo } from 'radash'
import { z } from 'zod'
import { Database, DocumentId, inferDocumentOf, inferNewDocumentOf, inferUpdatesOf } from '../services/database'
import useTiesDatabase from './ties'
import type { RevisionId } from '../services/database'

export const SwitchModel = z.object({
  driverId: DocumentId,
  title: z.string().min(1),
  path: z.string().min(1)
})

const useSwitchesDatabase = memo(
  () =>
    new (class extends Database.of('switches', SwitchModel) {
      readonly #ties = useTiesDatabase()

      override async remove(id: DocumentId, rev?: RevisionId) {
        await super.remove(id, rev)

        const related = await this.#ties.forSwitch(id)
        await Promise.all(
          related.map(async ({ _id, _rev }) => {
            await this.#ties.remove(_id, _rev)
          })
        )
      }
    })()
)

export type Switch = inferDocumentOf<typeof SwitchModel>
export const Switch = inferDocumentOf(SwitchModel)
export type NewSwitch = inferNewDocumentOf<typeof SwitchModel>
export const NewSwitch = inferNewDocumentOf(SwitchModel)
export type SwitchUpdate = inferUpdatesOf<typeof SwitchModel>
export const SwitchUpdate = inferUpdatesOf(SwitchModel)

export default useSwitchesDatabase
