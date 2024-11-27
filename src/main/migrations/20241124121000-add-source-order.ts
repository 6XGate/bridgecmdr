import { z } from 'zod'
import { Database } from '../services/database'

export async function migrate() {
  const OldModel = z.object({
    order: z.number().nonnegative().finite().optional(),
    title: z.string().min(1),
    image: z.string().min(1).nullable()
  })

  const sourcesDb = new Database('sources', OldModel)
  const sources = await sourcesDb.all()
  await Promise.all(
    sources.map(async (source, order) => {
      await sourcesDb.update({ order, ...source })
    })
  )

  await sourcesDb.close()
}
