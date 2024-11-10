import { memo } from 'radash'
import { z } from 'zod'
import useDrivers from '../services/drivers'
import { procedure, router } from '../services/rpc/trpc'

const Channel = z.number().int().nonnegative().finite()

const ActivateInputs = z.tuple([z.string().uuid(), z.string().url(), Channel, Channel, Channel])
const PowerInputs = z.tuple([z.string().uuid(), z.string().url()])

const useDriversRouter = memo(function useDriversRoute() {
  const drivers = useDrivers()

  return router({
    all: procedure.query(drivers.allInfo),
    get: procedure.input(z.string().uuid()).query(async ({ input }) => {
      await drivers.get(input)
    }),
    activate: procedure.input(ActivateInputs).mutation(async ({ input }) => {
      await drivers.activate(...input)
    }),
    powerOn: procedure.input(PowerInputs).mutation(async ({ input }) => {
      await drivers.powerOn(...input)
    }),
    powerOff: procedure.input(PowerInputs).mutation(async ({ input }) => {
      await drivers.powerOff(...input)
    })
  })
})

export default useDriversRouter
