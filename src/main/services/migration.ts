import { memo } from 'radash'
import { runLegacyMigrations } from './migration/leveldb'
import { runMigrations } from './migration/sqlite'

const useMigrations = memo(function useMigrations() {
  // Memoized so the UI can determine the results.
  const performMigration = memo(async function performMigration() {
    await runLegacyMigrations()
    await runMigrations()
  })

  return performMigration
})

export default useMigrations
