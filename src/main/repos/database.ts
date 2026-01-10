import { AsyncLocalStorage } from 'node:async_hooks'
import { mkdir } from 'node:fs/promises'
import { join, resolve } from 'node:path'
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
  devices: DeviceTable
  images: ImageTable
  settings: SettingTable
  sources: SourceTable
  ties: TieTable
}

export function newUuid() {
  return Buffer.from(v4({}, new Uint8Array(16)))
}

export function toUuidString(buffer: Buffer) {
  return uuidStringify(new Uint8Array(buffer)).toUpperCase() as UUID
}

export function fromUuidString(uuid: UUID) {
  return Buffer.from(uuidParse(uuid))
}

const getSqlDatabasePath = memo(function getSqlDatabasePath(): [string, string] {
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

  const appDataPath = resolve(app.getPath('appData'), ...qualifiedPath)

  return [appDataPath, 'store.sqlite']
})

/** Connects to the Kysely database, without remembering the connection. */
export async function makeConnection<DB>() {
  const [appDataPath, databaseFile] = getSqlDatabasePath()
  await mkdir(appDataPath, { recursive: true })

  return new Kysely<DB>({
    dialect: new SqliteDialect({
      database: new SQLite(join(appDataPath, databaseFile))
    })
  })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Makes the generic casts easier.
type KyselyConnection = Kysely<any>

const dbMigration = new AsyncLocalStorage<KyselyConnection>()

export async function migration<DB>(callback: (trx: Kysely<DB>) => Promise<void>): Promise<void> {
  const current = dbMigration.getStore()
  if (current != null) {
    await callback(current as Kysely<DB>)
    return
  }

  const db = await makeConnection<DB>()
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

let dbInstance: Kysely<DatabaseSchema> | null = null
async function getConnection() {
  if (dbInstance != null) return dbInstance
  dbInstance = await makeConnection<DatabaseSchema>()
  return dbInstance
}

const dbTransaction = new AsyncLocalStorage<KyselyConnection>()

export async function transaction<R>(callback: (trx: Kysely<DatabaseSchema>) => Promise<R>): Promise<R> {
  const current = dbTransaction.getStore()
  if (current != null) return await callback(current as Kysely<DatabaseSchema>)

  const db = await getConnection()
  const trx = await db.startTransaction().execute()
  return await dbTransaction.run(trx, async function () {
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
