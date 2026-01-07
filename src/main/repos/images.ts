// eslint-disable-next-line n/no-unsupported-features/node-builtins -- Backported
import { hash } from 'node:crypto'
import { memo } from 'radash'
import { fromUuidString, newUuid, toUuidString, useKysely } from './database'
import type { ColumnType, Insertable, Selectable } from 'kysely'
import type { UUID } from 'node:crypto'

export interface ImageTable {
  id: ColumnType<Buffer, Buffer, undefined>
  data: Buffer
  type: string
  hash: Buffer
}

type ImageRecord = Selectable<ImageTable>
type NewImagePayload = Insertable<ImageTable>

export const useImageRepository = memo(() => {
  const db = useKysely()

  function fromRecord(record: ImageRecord): Image {
    return {
      id: toUuidString(record.id),
      data: record.data,
      type: record.type,
      hash: record.hash
    }
  }

  function toNewPayload(payload: NewImage): NewImagePayload {
    return {
      id: newUuid(),
      data: payload.data,
      type: payload.type,
      hash: hash('sha256', new Uint8Array(payload.data), 'buffer')
    }
  }

  async function all(): Promise<Image[]> {
    return await db
      .selectFrom('images')
      .selectAll()
      .execute()
      .then((records) => records.map(fromRecord))
  }

  async function findById(id: UUID): Promise<Image | null> {
    return await db
      .selectFrom('images')
      .selectAll()
      .where('id', '=', fromUuidString(id))
      .executeTakeFirst()
      .then((record) => (record ? fromRecord(record) : null))
  }

  async function upsert(payload: NewImage): Promise<Image> {
    return await db
      .insertInto('images')
      .orIgnore()
      .values(toNewPayload(payload))
      .returningAll()
      .executeTakeFirstOrThrow()
      .then((record) => fromRecord(record))
  }

  async function deleteById(id: UUID): Promise<Image> {
    return await db
      .deleteFrom('images')
      .where('id', '=', fromUuidString(id))
      .returningAll()
      .executeTakeFirstOrThrow()
      .then((record) => fromRecord(record))
  }

  return {
    all,
    findById,
    upsert,
    deleteById
  }
})

interface ExternalImageSchema {
  id: ColumnType<UUID, UUID, undefined>
  data: Buffer
  type: string
  hash: ColumnType<Buffer, undefined, undefined>
}

export type Image = Selectable<ExternalImageSchema>
export type NewImage = Insertable<ExternalImageSchema>
