import { z } from 'zod'
import { Database, DocumentId } from '../services/database'

export async function migrate() {
  const Model = z.object({}).catchall(z.unknown())

  const OldModel = z
    .object({
      _id: DocumentId,
      sourceId: DocumentId,
      switchId: DocumentId,
      inputChannel: z.number().int().nonnegative(),
      outputChannels: z.object({
        video: z.number().int().nonnegative().optional(),
        audio: z.number().int().nonnegative().optional()
      })
    })
    .passthrough()

  const ties = new Database('ties', Model)

  for (const tie of await ties.all()) {
    const { switchId, ...old } = OldModel.parse(tie)

    // eslint-disable-next-line no-await-in-loop
    await ties.replace({ ...old, deviceId: switchId })
  }
}
