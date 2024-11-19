import { memo } from 'radash'
import { z } from 'zod'
import { Database, DocumentId, inferDocumentOf, inferNewDocumentOf, inferUpdatesOf } from '../services/database'
import useTiesDatabase from './ties'
import type { RevisionId } from '../services/database'

export const DeviceModel = z.object({
  driverId: DocumentId,
  title: z.string().min(1),
  path: z.string().min(1)
})

const useDevicesDatabase = memo(
  () =>
    new (class extends Database.of('switches', DeviceModel) {
      readonly #ties = useTiesDatabase()

      override async remove(id: DocumentId, rev?: RevisionId) {
        await super.remove(id, rev)

        const related = await this.#ties.forDevice(id)
        await Promise.all(
          related.map(async ({ _id, _rev }) => {
            await this.#ties.remove(_id, _rev)
          })
        )
      }
    })()
)

export type Device = inferDocumentOf<typeof DeviceModel>
export const Device = inferDocumentOf(DeviceModel)
export type NewDevice = inferNewDocumentOf<typeof DeviceModel>
export const NewDevice = inferNewDocumentOf(DeviceModel)
export type DeviceUpdate = inferUpdatesOf<typeof DeviceModel>
export const DeviceUpdate = inferUpdatesOf(DeviceModel)

export default useDevicesDatabase
