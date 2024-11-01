import { memo } from 'radash'
import useSerialPorts from '../services/ports'
import { procedure, router } from '../services/trpc'

const useSerialPortRouter = memo(function useSerialPortRouter() {
  const ports = useSerialPorts()

  return router({
    list: procedure.query(ports.list)
  })
})

export default useSerialPortRouter
