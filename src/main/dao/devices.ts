import { memo, shake } from 'radash'
import { z } from 'zod'
import { transaction } from '../repos/database'
import { useDevicesRepository } from '../repos/devices'
import { useTieRepository } from '../repos/ties'
import {
  Database,
  DocumentId,
  inferDocumentOf,
  inferNewDocumentOf,
  inferUpdatesOf,
  inferUpsertOf
} from '../services/database'
import useTiesDatabase from './ties'
import type { RevisionId } from '../services/database'
import type { Attachment } from '@/attachments'
import type { UUID } from 'node:crypto'

export const DeviceModel = z.object({
  driverId: DocumentId,
  title: z.string().min(1),
  path: z.string().min(1)
})

type DeviceDoc = inferDocumentOf<typeof DeviceModel>
type NewDeviceDoc = inferNewDocumentOf<typeof DeviceModel>
type DeviceUpdateDoc = inferUpdatesOf<typeof DeviceModel>
type DeviceUpsertDoc = inferUpsertOf<typeof DeviceModel>

class DeviceDao {
  private readonly repository = useDevicesRepository()
  private readonly ties = useTieRepository()

  async compact() {
    await Promise.resolve() // Compatibility.
  }

  async all(): Promise<DeviceDoc[]> {
    const devices = await this.repository.all()
    return devices.map((device) => ({
      _id: device.id,
      _rev: '0', // Dummy revision for compatibility.
      driverId: device.driverId,
      title: device.name,
      path: device.path,
      _attachments: []
    }))
  }

  async get(id: string): Promise<DeviceDoc> {
    const device = await this.repository.findById(id as UUID)
    if (!device) throw new Error('Device not found')

    return {
      _id: device.id,
      _rev: '0', // Dummy revision for compatibility.
      driverId: device.driverId,
      title: device.name,
      path: device.path,
      _attachments: []
    }
  }

  async add(payload: NewDeviceDoc, ..._: Attachment[]): Promise<DeviceDoc> {
    const device = await this.repository.upsert({
      driverId: payload.driverId as UUID,
      name: payload.title,
      path: payload.path
    })

    return {
      _id: device.id,
      _rev: '0', // Dummy revision for compatibility.
      driverId: device.driverId,
      title: device.name,
      path: device.path,
      _attachments: []
    }
  }

  async update(payload: DeviceUpdateDoc, ..._: Attachment[]): Promise<DeviceDoc> {
    const device = await this.repository.updateById(
      payload._id as UUID,
      shake({
        driverId: payload.driverId as UUID | undefined,
        name: payload.title,
        path: payload.path
      })
    )

    return {
      _id: device.id,
      _rev: '0', // Dummy revision for compatibility.
      driverId: device.driverId,
      title: device.name,
      path: device.path,
      _attachments: []
    }
  }

  async upsert(payload: DeviceUpsertDoc, ..._: Attachment[]): Promise<DeviceDoc> {
    const device = await this.repository.upsert({
      id: payload._id as UUID,
      driverId: payload.driverId as UUID,
      name: payload.title,
      path: payload.path
    })

    return {
      _id: device.id,
      _rev: '0', // Dummy revision for compatibility.
      driverId: device.driverId,
      title: device.name,
      path: device.path,
      _attachments: []
    }
  }

  async remove(id: string, _?: unknown): Promise<void> {
    await transaction(async () => {
      const device = await this.repository.deleteById(id as UUID)
      await this.ties.deleteByDeviceId(device.id)
    })
  }

  async clear(): Promise<void> {
    await transaction(async () => {
      await this.ties.deleteAll()
      await this.repository.deleteAll()
    })
  }
}

export const useDeviceDao = memo(() => new DeviceDao())

const useDevicesDatabase = memo(
  () =>
    new (class extends Database.of('devices', DeviceModel) {
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
export type DeviceUpsert = inferUpsertOf<typeof DeviceModel>
export const DeviceUpsert = inferUpsertOf(DeviceModel)

export default useDevicesDatabase
