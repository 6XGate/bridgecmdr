import { memo } from 'radash'
import useSerialPorts from '../services/ports'
import { procedure, router } from '../services/trpc'

// // HACK: Workaround legacy TypeDefinition from serialport PortInfo.
// export interface PortInfo {
//   path: string
//   manufacturer: string | undefined
//   serialNumber: string | undefined
//   pnpId: string | undefined
//   locationId: string | undefined
//   productId: string | undefined
//   vendorId: string | undefined
// }

// export interface PortEntry extends PortInfo {
//   title: string
//   value: string
// }

const useSerialPortRouter = memo(function useSerialPortRouter() {
  const ports = useSerialPorts()

  return router({
    list: procedure.query(ports.list)
  })
})

export default useSerialPortRouter
