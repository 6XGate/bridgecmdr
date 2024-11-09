import { memo } from 'radash'
import useStartup from '../services/startup'
import { procedure, router } from '../services/trpc'

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
