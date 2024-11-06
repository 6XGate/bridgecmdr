import { memo } from 'radash'
import { z } from 'zod'
import useSystem from '../services/system'
import { procedure, router } from '../services/trpc'

const useSystemRouter = memo(function useSystemRouter() {
  const system = useSystem()

  return router({
    powerOff: procedure.input(z.boolean().optional()).mutation(async ({ input }) => {
      await system.powerOff(input)
    })
  })
})

export default useSystemRouter
