import { memo, shake } from 'radash'
import { newUuid, fromUuidString, useKysely, toUuidString } from './database'
import type { ColumnType, Insertable, Selectable, Updateable } from 'kysely'
import type { Buffer } from 'node:buffer'
import type { UUID } from 'node:crypto'

export interface DeviceTable {
  id: ColumnType<Buffer, Buffer, undefined>
  driver_id: Buffer
  name: string
  path: string
}

type DeviceRecord = Selectable<DeviceTable>
type NewDevicePayload = Insertable<DeviceTable>
type DeviceUpdatePayload = Updateable<DeviceTable>

export const useDevicesRepository = memo(function useDevicesRepository() {
  const db = useKysely()

  function fromRecord(record: DeviceRecord): Device {
    return {
      id: toUuidString(record.id),
      driverId: toUuidString(record.driver_id),
      name: record.name,
      path: record.path
    }
  }

  function toNewPayload(payload: NewDevice): NewDevicePayload {
    return {
      id: newUuid(),
      driver_id: fromUuidString(payload.driverId),
      name: payload.name,
      path: payload.path
    }
  }

  function toUpdatePayload(payload: DeviceUpdate): DeviceUpdatePayload {
    return shake({
      driver_id: payload.driverId ? fromUuidString(payload.driverId) : undefined,
      name: payload.name,
      path: payload.path
    })
  }

  async function all(): Promise<Device[]> {
    return await db
      .selectFrom('devices')
      .selectAll()
      .execute()
      .then((records) => records.map(fromRecord))
  }

  async function findById(id: UUID): Promise<Device | null> {
    return await db
      .selectFrom('devices')
      .selectAll()
      .where('id', '=', fromUuidString(id))
      .executeTakeFirst()
      .then((record) => (record ? fromRecord(record) : null))
  }

  async function insert(payload: NewDevice): Promise<Device> {
    return await db
      .insertInto('devices')
      .values(toNewPayload(payload))
      .returningAll()
      .executeTakeFirstOrThrow()
      .then((record) => fromRecord(record))
  }

  async function updateById(id: UUID, payload: DeviceUpdate): Promise<Device> {
    return await db
      .updateTable('devices')
      .set(toUpdatePayload(payload))
      .where('id', '=', fromUuidString(id))
      .returningAll()
      .executeTakeFirstOrThrow()
      .then((record) => fromRecord(record))
  }

  async function deleteById(id: UUID): Promise<Device> {
    return await db
      .deleteFrom('devices')
      .where('id', '=', fromUuidString(id))
      .returningAll()
      .executeTakeFirstOrThrow()
      .then((record) => fromRecord(record))
  }

  return {
    all,
    findById,
    insert,
    updateById,
    deleteById
  }
})

interface ExternalTableSchema {
  id: ColumnType<UUID, UUID, undefined>
  driverId: UUID
  name: string
  path: string
}

export type Device = Selectable<ExternalTableSchema>
export type NewDevice = Insertable<ExternalTableSchema>
export type DeviceUpdate = Updateable<ExternalTableSchema>
