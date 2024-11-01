import { z } from 'zod'
import { defineDatabase, getInsertable, getUpdateable } from '../services/database'
import useTiesDatabase from './ties'
import type { getDocument, DocumentId } from '../services/database'

export type Source = getDocument<typeof Source>
export const Source = z.object({
  title: z.string().min(1),
  image: z.string().min(1).nullable()
})

export const useSourcesDatabase = defineDatabase({
  name: 'sources',
  schema: Source,
  setup: (base) => {
    const ties = useTiesDatabase()

    return {
      remove: async (id: DocumentId) => {
        await base.remove(id)

        const related = await ties.forSource(id)
        await Promise.all(
          related.map(async ({ _id }) => {
            await ties.remove(_id)
          })
        )
      }
    }
  }
})

export type NewSource = getInsertable<typeof Source>
export const NewSource = getInsertable(Source)
export type SourceUpdate = getUpdateable<typeof Source>
export const SourceUpdate = getUpdateable(Source)
