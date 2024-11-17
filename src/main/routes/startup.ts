import { memo } from 'radash'
import { procedure, router } from '../services/rpc/trpc'
import useStartup from '../services/startup'

const useStartupRouter = memo(function useStartupRouter() {
  const startup = useStartup()
  return router({
    checkEnabled: procedure.query(async () => await startup.checkEnabled()),
    checkUp: procedure.mutation(async () => {
      await startup.checkUp()
    }),
    enable: procedure.mutation(async () => {
      await startup.enable()
    }),
    disable: procedure.mutation(async () => {
      await startup.disable()
    })
  })
})

export default useStartupRouter
