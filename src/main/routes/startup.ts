import { memo } from 'radash'
import { procedure, router } from '../services/rpc/trpc'
import useStartup from '../services/startup'

const useStartupRouter = memo(function useStartupRouter() {
  const startup = useStartup()
  return router({
    checkEnabled: procedure.query(async () => await (await startup).checkEnabled()),
    enable: procedure.mutation(async () => {
      await (await startup).enable()
    }),
    disable: procedure.mutation(async () => {
      await (await startup).disable()
    })
  })
})

export default useStartupRouter
