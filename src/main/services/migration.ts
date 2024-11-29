import { basename } from 'node:path'
import Logger from 'electron-log'
import { alphabetical, memo } from 'radash'
import { z } from 'zod'
import { useLevelDb } from './level'

export type Migration = z.infer<typeof Migration>
export const Migration = z
  .object({
    migrate: z.function(z.tuple([]), z.unknown())
  })
  .transform((m) => m.migrate)

type State = z.infer<typeof State>
const State = z.enum(['missed', 'failed', 'done'])
const StateInDb = z
  .union([z.instanceof(Buffer), State])
  /* v8 ignore next 1 */ // Generally one or the other most of the time.
  .transform((v) => (Buffer.isBuffer(v) ? State.parse(v.toString()) : v))

const useMigrations = memo(function useMigrations() {
  /** Gets the sorted list of migration modules. */
  function loadMigrations() {
    const migrations = Object.entries(import.meta.glob('../migrations/**/*', { eager: true })).map(
      ([name, module]) => ({ name, migrate: Migration.parse(module) })
    )

    return alphabetical(migrations, (m) => m.name)
  }

  /** Opens a connection to the migration database. */
  async function openMigrationDatabase() {
    return await useLevelDb().levelup('_migrations')
  }

  // Memoized so the UI can determine the results.
  const performMigration = memo(async function performMigration() {
    Logger.debug('Loading migration information')
    const migrations = loadMigrations()
    const database = await openMigrationDatabase()

    /* eslint-disable no-await-in-loop */
    for (const migration of migrations) {
      const name = basename(migration.name, '.ts')

      const state = StateInDb.parse(await database.get(name).catch(() => 'missed'))
      if (state === 'done') continue

      /* v8 ignore next 2 */ // Difficult to test without injecting a broken migration.
      if (state === 'failed') {
        Logger.warn(`Attempting failed migration again: ${name}`)
      } else {
        Logger.debug(`Attempting migration: ${name}`)
      }

      try {
        await migration.migrate()
        /* v8 ignore next 4 */ // Difficult to test without injecting a broken migration.
      } catch (cause) {
        await database.put(name, 'failed')
        throw new Error(`Failed to complete migration: ${name}`, { cause })
      }

      try {
        await database.put(name, 'done')
        /* v8 ignore next 4 */ // Difficult to test without injecting a broken migration.
      } catch (cause) {
        await database.put(name, 'failed')
        throw new Error(`Failed to record migration completion: ${name}`, { cause })
      }
    }
    /* eslint-enable no-await-in-loop */

    await database.close()
  })

  return performMigration
})

export default useMigrations
