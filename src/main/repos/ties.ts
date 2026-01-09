import { memo, shake } from 'radash'
import { fromUuidString, newUuid, toUuidString, useKysely } from './database'
import type { ColumnType, Insertable, Selectable, Updateable } from 'kysely'
import type { Buffer } from 'node:buffer'
import type { UUID } from 'node:crypto'

export interface TieTable {
  id: ColumnType<Buffer, Buffer, undefined>
  source_id: Buffer
  device_id: Buffer
  input_channel: number
  output_video_channel: number | null
  output_audio_channel: number | null
}

type TieRecord = Selectable<TieTable>
type NewTiePayload = Insertable<TieTable>
type TieUpdatePayload = Updateable<TieTable>

function fromRecord(record: TieRecord): Tie {
  return {
    id: toUuidString(record.id),
    sourceId: toUuidString(record.source_id),
    deviceId: toUuidString(record.device_id),
    inputChannel: record.input_channel,
    outputVideoChannel: record.output_video_channel,
    outputAudioChannel: record.output_audio_channel
  }
}

function toNewPayload(payload: NewTie): NewTiePayload {
  return {
    id: payload.id ? fromUuidString(payload.id) : newUuid(),
    source_id: fromUuidString(payload.sourceId),
    device_id: fromUuidString(payload.deviceId),
    input_channel: payload.inputChannel,
    output_video_channel: payload.outputVideoChannel ?? null,
    output_audio_channel: payload.outputAudioChannel ?? null
  }
}

function toUpdatePayload(payload: TieUpdate): TieUpdatePayload {
  return shake({
    source_id: payload.sourceId ? fromUuidString(payload.sourceId) : undefined,
    device_id: payload.deviceId ? fromUuidString(payload.deviceId) : undefined,
    input_channel: payload.inputChannel,
    output_video_channel: payload.outputVideoChannel,
    output_audio_channel: payload.outputAudioChannel
  })
}

class TieRepository {
  async all(): Promise<Tie[]> {
    return await useKysely()
      .selectFrom('ties')
      .selectAll()
      .execute()
      .then((records) => records.map(fromRecord))
  }

  async findById(id: UUID): Promise<Tie | null> {
    return await useKysely()
      .selectFrom('ties')
      .selectAll()
      .where('id', '=', fromUuidString(id))
      .executeTakeFirst()
      .then((record) => (record ? fromRecord(record) : null))
  }

  async findBySourceId(sourceId: UUID): Promise<Tie[]> {
    return await useKysely()
      .selectFrom('ties')
      .selectAll()
      .where('source_id', '=', fromUuidString(sourceId))
      .execute()
      .then((records) => records.map(fromRecord))
  }

  async findByDeviceId(deviceId: UUID): Promise<Tie[]> {
    return await useKysely()
      .selectFrom('ties')
      .selectAll()
      .where('device_id', '=', fromUuidString(deviceId))
      .execute()
      .then((records) => records.map(fromRecord))
  }

  async insert(payload: NewTie): Promise<Tie> {
    return await useKysely()
      .insertInto('ties')
      .values(toNewPayload(payload))
      .returningAll()
      .executeTakeFirstOrThrow()
      .then((record) => fromRecord(record))
  }

  async updateById(id: UUID, payload: TieUpdate): Promise<Tie> {
    return await useKysely()
      .updateTable('ties')
      .set(toUpdatePayload(payload))
      .where('id', '=', fromUuidString(id))
      .returningAll()
      .executeTakeFirstOrThrow()
      .then((record) => fromRecord(record))
  }

  async upsert(payload: NewTie): Promise<Tie> {
    return await useKysely()
      .replaceInto('ties')
      .values(toNewPayload(payload))
      .returningAll()
      .executeTakeFirstOrThrow()
      .then((record) => fromRecord(record))
  }

  async deleteAll(): Promise<void> {
    await useKysely().deleteFrom('ties').execute()
  }

  async deleteById(id: UUID): Promise<Tie> {
    return await useKysely()
      .deleteFrom('ties')
      .where('id', '=', fromUuidString(id))
      .returningAll()
      .executeTakeFirstOrThrow()
      .then((record) => fromRecord(record))
  }

  async deleteBySourceId(sourceId: UUID): Promise<Tie[]> {
    return await useKysely()
      .deleteFrom('ties')
      .where('source_id', '=', fromUuidString(sourceId))
      .returningAll()
      .execute()
      .then((records) => records.map(fromRecord))
  }

  async deleteByDeviceId(deviceId: UUID): Promise<Tie[]> {
    return await useKysely()
      .deleteFrom('ties')
      .where('device_id', '=', fromUuidString(deviceId))
      .returningAll()
      .execute()
      .then((records) => records.map(fromRecord))
  }
}

export const useTieRepository = memo(() => new TieRepository())

interface ExternalTieSchema {
  id: ColumnType<UUID, UUID | undefined, undefined>
  sourceId: UUID
  deviceId: UUID
  inputChannel: number
  outputVideoChannel: number | null
  outputAudioChannel: number | null
}

export type Tie = Selectable<ExternalTieSchema>
export type NewTie = Insertable<ExternalTieSchema>
export type TieUpdate = Updateable<ExternalTieSchema>
