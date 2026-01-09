import { memo, shake } from 'radash'
import { fromUuidString, newUuid, toUuidString, useKysely } from './database'
import type { ColumnType, Insertable, Selectable, Updateable } from 'kysely'
import type { UUID } from 'node:crypto'

export interface SourceTable {
  id: ColumnType<Buffer, Buffer, undefined>
  title: string
  image: Buffer | null
}

type SourceRecord = Selectable<SourceTable>
type NewSourcePayload = Insertable<SourceTable>
type SourceUpdatePayload = Updateable<SourceTable>

function fromRecord(record: SourceRecord): Source {
  return {
    id: toUuidString(record.id),
    title: record.title,
    image: record.image ? toUuidString(record.image) : null
  }
}

function toNewPayload(payload: NewSource): NewSourcePayload {
  return {
    id: payload.id ? fromUuidString(payload.id) : newUuid(),
    title: payload.title,
    image: payload.image ? fromUuidString(payload.image) : null
  }
}

function toUpdatePayload(payload: SourceUpdate): SourceUpdatePayload {
  let image
  if (payload.image === null) image = null
  else if (payload.image) image = fromUuidString(payload.image)

  return shake({
    title: payload.title,
    image
  })
}

class SourceRepository {
  async all(): Promise<Source[]> {
    return await useKysely()
      .selectFrom('sources')
      .selectAll()
      .execute()
      .then((records) => records.map(fromRecord))
  }

  async findById(id: UUID): Promise<Source | null> {
    return await useKysely()
      .selectFrom('sources')
      .selectAll()
      .where('id', '=', fromUuidString(id))
      .executeTakeFirst()
      .then((record) => (record ? fromRecord(record) : null))
  }

  async insert(payload: NewSource): Promise<Source> {
    return await useKysely()
      .insertInto('sources')
      .values(toNewPayload(payload))
      .returningAll()
      .executeTakeFirstOrThrow()
      .then((record) => fromRecord(record))
  }

  async updateById(id: UUID, payload: SourceUpdate): Promise<Source> {
    return await useKysely()
      .updateTable('sources')
      .set(toUpdatePayload(payload))
      .where('id', '=', fromUuidString(id))
      .returningAll()
      .executeTakeFirstOrThrow()
      .then((record) => fromRecord(record))
  }

  async upsert(payload: NewSource): Promise<Source> {
    return await useKysely()
      .replaceInto('sources')
      .values(toNewPayload(payload))
      .returningAll()
      .executeTakeFirstOrThrow()
      .then((record) => fromRecord(record))
  }

  async deleteAll(): Promise<void> {
    await useKysely().deleteFrom('sources').execute()
  }

  async deleteById(id: UUID): Promise<Source> {
    return await useKysely()
      .deleteFrom('sources')
      .where('id', '=', fromUuidString(id))
      .returningAll()
      .executeTakeFirstOrThrow()
      .then((record) => fromRecord(record))
  }
}

export const useSourceRepository = memo(() => new SourceRepository())

interface ExternalSourceSchema {
  id: ColumnType<UUID, UUID | undefined, undefined>
  title: string
  image: UUID | null
}

export type Source = Selectable<ExternalSourceSchema>
export type NewSource = Insertable<ExternalSourceSchema>
export type SourceUpdate = Updateable<ExternalSourceSchema>
