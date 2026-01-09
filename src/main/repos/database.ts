import { AsyncLocalStorage } from 'node:async_hooks'
import { resolve } from 'node:path'
import SQLite from 'better-sqlite3'
import { app } from 'electron'
import { Kysely, SqliteDialect } from 'kysely'
import { memo } from 'radash'
import { parse as uuidParse, stringify as uuidStringify, v4 } from 'uuid'
import type { DeviceTable } from './devices'
import type { ImageTable } from './images'
import type { SettingTable } from './settings'
import type { SourceTable } from './sources'
import type { TieTable } from './ties'
import type { UUID } from 'node:crypto'

export default interface DatabaseSchema {
  settings: SettingTable
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Makes the generic casts easier.
type KyselyConnection = Kysely<any>

const dbMigration = new AsyncLocalStorage<KyselyConnection>()

export async function kyselyMigration<DB>(callback: (trx: Kysely<DB>) => Promise<void>): Promise<void> {
  const current = dbMigration.getStore()
  if (current != null) {
    await callback(current as Kysely<DB>)
    return
  }

  const db = kyselyConnect<DB>()
  try {
    const trx = await db.startTransaction().execute()
    await dbMigration.run(trx, async () => {
      try {
        await callback(trx as Kysely<DB>)
        await trx.commit().execute()
      } catch (err) {
        await trx.rollback().execute()
        throw err
      }
    })
  } finally {
    await db.destroy()
  }
}

const connect = memo(() => kyselyConnect<DatabaseSchema>())

const dbTransaction = new AsyncLocalStorage<KyselyConnection>()

/** Connects to the Kysely database. */
export function useKysely(): Kysely<DatabaseSchema> {
  const current = dbTransaction.getStore()
  if (current != null) return current as Kysely<DatabaseSchema>

  return connect()
}

export async function transaction<R>(callback: (trx: Kysely<DatabaseSchema>) => Promise<R>): Promise<R> {
  const current = dbTransaction.getStore()
  if (current != null) return await callback(current as Kysely<DatabaseSchema>)

  const trx = await connect().startTransaction().execute()
  return await dbTransaction.run(trx, async () => {
    try {
      const result = await callback(trx)
      await trx.commit().execute()
      return result
    } catch (err) {
      await trx.rollback().execute()
      throw err
    }
  })
}
