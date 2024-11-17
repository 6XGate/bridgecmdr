import { memo } from 'radash'
import { z } from 'zod'
import { Database, inferDocumentOf, inferNewDocumentOf, inferUpdatesOf } from '../services/database'
import useTiesDatabase from './ties'
import type { DocumentId, RevisionId } from '../services/database'

export const SourceModel = z.object({
  title: z.string().min(1),
  image: z.string().min(1).nullable()
})

const useSourcesDatabase = memo(
  () =>
    new (class extends Database.of('sources', SourceModel) {
      readonly #ties = useTiesDatabase()

      override async remove(id: DocumentId, rev?: RevisionId) {
        await super.remove(id, rev)

        const related = await this.#ties.forSource(id)
        await Promise.all(
          related.map(async ({ _id, _rev }) => {
            await this.#ties.remove(_id, _rev)
          })
        )
      }
    })()
)

export type Source = inferDocumentOf<typeof SourceModel>
export const Source = inferDocumentOf(SourceModel)
export type NewSource = inferNewDocumentOf<typeof SourceModel>
export const NewSource = inferNewDocumentOf(SourceModel)
export type SourceUpdate = inferUpdatesOf<typeof SourceModel>
export const SourceUpdate = inferUpdatesOf(SourceModel)

export default useSourcesDatabase
