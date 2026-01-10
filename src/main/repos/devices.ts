import { memo, shake } from 'radash'
import { newUuid, fromUuidString, toUuidString, transaction } from './database'
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
    id: payload.id ? fromUuidString(payload.id) : newUuid(),
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

class DevicesRepository {
  async all(): Promise<Device[]> {
    return await transaction(
      async (db) =>
        await db
          .selectFrom('devices')
          .selectAll()
          .execute()
          .then((records) => records.map(fromRecord))
    )
  }

  async findById(id: UUID): Promise<Device | null> {
    return await transaction(
      async (db) =>
        await db
          .selectFrom('devices')
          .selectAll()
          .where('id', '=', fromUuidString(id))
          .executeTakeFirst()
          .then((record) => (record ? fromRecord(record) : null))
    )
  }

  async insert(payload: NewDevice): Promise<Device> {
    return await transaction(
      async (db) =>
        await db
          .insertInto('devices')
          .values(toNewPayload(payload))
          .returningAll()
          .executeTakeFirstOrThrow()
          .then((record) => fromRecord(record))
    )
  }

  async updateById(id: UUID, payload: DeviceUpdate): Promise<Device> {
    return await transaction(
      async (db) =>
        await db
          .updateTable('devices')
          .set(toUpdatePayload(payload))
          .where('id', '=', fromUuidString(id))
          .returningAll()
          .executeTakeFirstOrThrow()
          .then((record) => fromRecord(record))
    )
  }

  async upsert(payload: NewDevice): Promise<Device> {
    return await transaction(
      async (db) =>
        await db
          .insertInto('devices')
          .orReplace()
          .values(toNewPayload(payload))
          .returningAll()
          .executeTakeFirstOrThrow()
          .then((record) => fromRecord(record))
    )
  }

  async deleteAll(): Promise<void> {
    await transaction(async (db) => await db.deleteFrom('devices').execute())
  }

  async deleteById(id: UUID): Promise<Device> {
    return await transaction(
      async (db) =>
        await db
          .deleteFrom('devices')
          .where('id', '=', fromUuidString(id))
          .returningAll()
          .executeTakeFirstOrThrow()
          .then((record) => fromRecord(record))
    )
  }
}

export const useDevicesRepository = memo(() => new DevicesRepository())

interface ExternalTableSchema {
  id: ColumnType<UUID, UUID | undefined, undefined>
  driverId: UUID
  name: string
  path: string
}

export type Device = Selectable<ExternalTableSchema>
export type NewDevice = Insertable<ExternalTableSchema>
export type DeviceUpdate = Updateable<ExternalTableSchema>
