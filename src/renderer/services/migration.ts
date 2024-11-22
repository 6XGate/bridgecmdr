import { createSharedComposable } from '@vueuse/shared'
import { trackBusy } from '../hooks/tracking'
import { useClient } from './rpc/trpc'

const useMigration = createSharedComposable(function useMigration() {
  const tracker = trackBusy()
  const client = useClient()

  const migrate = tracker.track(async function migrate() {
    await client.migration.migrate.mutate()
  })

  return migrate
})

export default useMigration
