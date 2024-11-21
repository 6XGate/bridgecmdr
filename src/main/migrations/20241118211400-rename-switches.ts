import { z } from 'zod'
import { Database, DocumentId } from '../services/database'

export async function migrate() {
  const Model = z.object({
    driverId: DocumentId,
    title: z.string().min(1),
    path: z.string().min(1)
  })

  const switches = new Database('switches', Model)
  const devices = new Database('devices', Model)

  for (const device of await switches.all()) {
    // eslint-disable-next-line no-await-in-loop
    await devices.upsert(device)
  }

  await switches.destroy()
  await devices.close()
}
