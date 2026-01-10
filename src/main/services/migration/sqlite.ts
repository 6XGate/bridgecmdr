import { basename } from 'node:path'
import Logger from 'electron-log'
import { alphabetical, defer } from 'radash'
import { Umzug } from 'umzug'
import { makeConnection } from '../../repos/database'
import type { Kysely } from 'kysely'
import type { MigrationParams, RunnableMigration, UmzugStorage } from 'umzug'

interface BareDatabaseSchema {
  bridgecmdr_migrations: { name: string; date: string }
}

type Transaction = Kysely<BareDatabaseSchema>
type Migration = Omit<RunnableMigration<Transaction>, 'name' | 'path' | 'down'>

class MigrationStorage implements UmzugStorage<Transaction> {
  async logMigration({ name, context }: MigrationParams<Transaction>): Promise<void> {
    await context.insertInto('bridgecmdr_migrations').values({ name, date: new Date().toISOString() }).execute()
  }

  async unlogMigration({ name, context }: MigrationParams<Transaction>): Promise<void> {
    await context.deleteFrom('bridgecmdr_migrations').where('name', '=', name).execute()
  }

  async executed({ context }: Pick<MigrationParams<Transaction>, 'context'>): Promise<string[]> {
    const rows = await context.selectFrom('bridgecmdr_migrations').select(['name']).execute()
    return rows.map((r) => r.name)
  }
}

export async function runMigrations() {
  await defer(async function $runMigrations(cleanup) {
    Logger.debug('Loading migration information')
    const migrations = Object.entries<Migration>(import.meta.glob('../../migrations/sqlite/**/*', { eager: true })).map(
      ([name, { up }]) => ({ name: basename(name, '.ts'), up })
    )

    const database = await makeConnection<BareDatabaseSchema>()
    cleanup(async () => {
      Logger.debug('Finished migration')
      await database.destroy()
    })

    await database.schema
      .createTable('bridgecmdr_migrations')
      .ifNotExists()
      .addColumn('name', 'text', (col) => col.primaryKey())
      .addColumn('date', 'text')
      .execute()

    await database.transaction().execute(async function migrate(trx) {
      const migrator = new Umzug({
        migrations: alphabetical(migrations, (m) => m.name),
        context: () => trx,
        storage: new MigrationStorage(),
        logger: Logger
      })

      await migrator.up()
    })
  })
}
