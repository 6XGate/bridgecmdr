import { basename } from 'node:path'
import Logger from 'electron-log'
import { alphabetical, defer } from 'radash'
import { Umzug } from 'umzug'
import { useLevelDb } from '../level'
import type { LevelStorage } from '../level'
import type { MigrationParams, RunnableMigration, UmzugStorage } from 'umzug'

type Migration = Omit<RunnableMigration<object>, 'name' | 'path' | 'down'>

class LegacyMigrationStorage implements UmzugStorage<object> {
  private readonly database

  constructor(database: LevelStorage) {
    this.database = database
  }

  async logMigration(params: MigrationParams<object>): Promise<void> {
    await this.database.put(params.name, 'done')
  }

  async unlogMigration(params: MigrationParams<object>): Promise<void> {
    await this.database.del(params.name)
  }

  async executed(_: Pick<MigrationParams<object>, 'context'>): Promise<string[]> {
    const executed = new Array<string>()
    for await (const [name, status] of this.database.iterator({ keyAsBuffer: false, valueAsBuffer: false })) {
      if (status === 'done') executed.push(name)
    }

    return executed
  }
}

export async function runLegacyMigrations() {
  await defer(async function $runLegacyMigrations(cleanup) {
    Logger.debug('Loading legacy migration information')
    const migrations = Object.entries<Migration>(
      import.meta.glob('../../migrations/leveldb/**/*', { eager: true })
    ).map(([name, { up }]) => ({ name: basename(name, '.ts'), up }))

    const database = await useLevelDb().levelup('_migrations')
    cleanup(async () => {
      Logger.debug('Finished legacy migration')
      await database.close()
    })

    const migrator = new Umzug({
      migrations: alphabetical(migrations, (m) => m.name),
      context: () => ({}),
      storage: new LegacyMigrationStorage(database),
      logger: Logger
    })

    await migrator.up()
  })
}
