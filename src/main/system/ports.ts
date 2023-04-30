import { SerialPort } from 'serialport'
import type { PortApi } from '@preload/api'

const useSerialPorts = () => {
  const list = SerialPort.list

  // TODO: Other methods?

  return {
    list
  } satisfies PortApi
}

export default useSerialPorts
