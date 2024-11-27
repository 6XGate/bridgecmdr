import { memo } from 'radash'
import { z } from 'zod'
import { Database, inferDocumentOf, inferNewDocumentOf, inferUpdatesOf, inferUpsertOf } from '../services/database'
import useTiesDatabase from './ties'
import type { DocumentId, RevisionId } from '../services/database'

export const SourceModel = z.object({
  order: z.number().nonnegative().finite(),
  title: z.string().min(1),
  image: z.string().min(1).nullable()
})

const useSourcesDatabase = memo(
  () =>
    new (class extends Database.of('sources', SourceModel) {
      readonly #ties = useTiesDatabase()

      async getNextOrderValue() {
        return await this.run(async function getNextOrderValue(db) {
          const mapped = await db.query<number>({
            /* v8 ignore next 2 */ // Not executed in a way V8 can see.
            map: (doc, emit) => emit?.(doc.order, doc.order),
            reduce: (_, values) => 1 + Math.max(...values.map(Number))
          })

          const row = mapped.rows[0]
          if (row == null) return 0

          return row.value as number
        })
      }

      async normalizeOrder() {
        const sources = await this.all()
        let i = 0
        for (const source of sources.toSorted((a, b) => a.order - b.order)) {
          source.order = i
          i += 1
        }

        await Promise.all(
          sources.map(async (source) => {
            await this.update(source)
          })
        )
      }

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
export type SourceUpsert = inferUpsertOf<typeof SourceModel>
export const SourceUpsert = inferUpsertOf(SourceModel)

export default useSourcesDatabase
