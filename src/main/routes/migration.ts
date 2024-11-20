import { memo } from 'radash'
import useMigrations from '../services/migration'
import { procedure, router } from '../services/rpc/trpc'

const useMigrationRouter = memo(function useMigrationRouter() {
  const migrate = useMigrations()

  return router({
    migrate: procedure.mutation(async () => {
      await migrate()
    })
  })
})

export default useMigrationRouter
