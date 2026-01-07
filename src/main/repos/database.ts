import { resolve } from 'node:path'
import SQLite from 'better-sqlite3'
import { app } from 'electron'
import { Kysely, SqliteDialect } from 'kysely'
import { memo } from 'radash'
import { parse as uuidParse, stringify as uuidStringify, v4 } from 'uuid'
import type { DeviceTable } from './devices'
import type { ImageTable } from './images'
import type { SourceTable } from './sources'
import type { TieTable } from './ties'
import type { ControlledTransaction } from 'kysely'
import type { UUID } from 'node:crypto'

export default interface DatabaseSchema {
  devices: DeviceTable
  images: ImageTable
  sources: SourceTable
  ties: TieTable
}

export function newUuid() {
  return Buffer.from(v4({}, new Uint8Array(16)))
}

export function toUuidString(buffer: Buffer) {
  return uuidStringify(new Uint8Array(buffer)) as UUID
}

export function fromUuidString(uuid: UUID) {
  return Buffer.from(uuidParse(uuid))
}

export async function kyselyMigration<DB>(callback: (trx: ControlledTransaction<DB>) => Promise<void>): Promise<void> {
  const db = kyselyConnect<DB>()
  const trx = await db.startTransaction().execute()
  try {
    await callback(trx)
    await trx.commit().execute()
  } catch (err) {
    await trx.rollback().execute()
    throw err
  } finally {
    await db.destroy()
  }
}

export async function transaction<DB, R>(
  db: Kysely<DB>,
  callback: (trx: ControlledTransaction<DB>) => Promise<R>
): Promise<R> {
  const trx = await db.startTransaction().execute()
  try {
    const result = await callback(trx)
    await trx.commit().execute()
    return result
  } catch (err) {
    await trx.rollback().execute()
    throw err
  }
}

/** Connects to the Kysely database, without remembering the connection. */
export function kyselyConnect<DB>() {
  // Since BridgeCmdr v3 will use the XDG spec, Windows recommended,
  // and macOS recommended directory structure. Which electron.js
  // doesn't entirely follow, we will manually construct the
  // paths for the new SQLite database.
  let qualifiedPath
  switch (true) {
    case process.platform === 'win32':
      qualifiedPath = ['Matthew Holder', 'BridgeCmdr']
      break
    case process.platform === 'darwin':
      qualifiedPath = ['org.sleepingcats.bridgecmdr']
      break
    default:
      qualifiedPath = ['bridgecmdr']
      break
  }

  return new Kysely<DB>({
    dialect: new SqliteDialect({
      database: new SQLite(resolve(app.getPath('appData'), ...qualifiedPath, 'store.test.sqlite'))
    })
  })
}

/** Connects to the Kysely database. */
export const useKysely = memo(() => kyselyConnect<DatabaseSchema>())
