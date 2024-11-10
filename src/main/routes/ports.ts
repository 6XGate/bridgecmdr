import { memo } from 'radash'
import { z } from 'zod'
import useSerialPorts from '../services/ports'
import { procedure, router } from '../services/rpc/trpc'

const useSerialPortRouter = memo(function useSerialPortRouter() {
  const ports = useSerialPorts()

  return router({
    list: procedure.query(ports.listPorts),
    isPort: procedure.input(z.string()).query(async ({ input }) => await ports.isValidPort(input))
  })
})

export default useSerialPortRouter
