// eslint-disable-next-line n/no-unsupported-features/node-builtins -- Backported
import { hash } from 'node:crypto'
import { memo } from 'radash'
import { fromUuidString, newUuid, toUuidString, transaction } from './database'
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
    id: payload.id ? fromUuidString(payload.id) : newUuid(),
    data: payload.data,
    type: payload.type,
    hash: hash('sha256', new Uint8Array(payload.data), 'buffer')
  }
}

class ImageRepository {
  async all(): Promise<Image[]> {
    return await transaction(
      async (trx) =>
        await trx
          .selectFrom('images')
          .selectAll()
          .execute()
          .then((records) => records.map(fromRecord))
    )
  }

  async findById(id: UUID): Promise<Image | null> {
    return await transaction(
      async (trx) =>
        await trx
          .selectFrom('images')
          .selectAll()
          .where('id', '=', fromUuidString(id))
          .executeTakeFirst()
          .then((record) => (record ? fromRecord(record) : null))
    )
  }

  async upsert(payload: NewImage): Promise<Image> {
    return await transaction(
      async (trx) =>
        await trx
          .insertInto('images')
          // On conflict, something has to be updated to get a return value.
          .onConflict((query) => query.column('hash').doUpdateSet({ type: payload.type }))
          .values(toNewPayload(payload))
          .returningAll()
          .executeTakeFirstOrThrow()
          .then((record) => fromRecord(record))
    )
  }

  async deleteById(id: UUID): Promise<Image> {
    return await transaction(
      async (trx) =>
        await trx
          .deleteFrom('images')
          .where('id', '=', fromUuidString(id))
          .returningAll()
          .executeTakeFirstOrThrow()
          .then((record) => fromRecord(record))
    )
  }
}

export const useImageRepository = memo(() => new ImageRepository())

interface ExternalImageSchema {
  id: ColumnType<UUID, UUID | undefined, undefined>
  data: Buffer
  type: string
  hash: ColumnType<Buffer, undefined, undefined>
}

export type Image = Selectable<ExternalImageSchema>
export type NewImage = Insertable<ExternalImageSchema>
