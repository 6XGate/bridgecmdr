import useIpc from '../support'
import type { DriverApi } from '../api'

const useDriverApi = () => {
  const ipc = useIpc()

  return {
    capabilities: Object.freeze({
      kDeviceHasNoExtraCapabilities: 0,
      kDeviceSupportsMultipleOutputs: 1,
      kDeviceCanDecoupleAudioOutput: 2
    }),
    list: ipc.useInvoke('driver:list'),
    open: ipc.useInvoke('driver:open'),
    activate: ipc.useInvoke('driver:activate'),
    powerOn: ipc.useInvoke('driver:powerOn'),
    powerOff: ipc.useInvoke('driver:powerOff')
  } satisfies DriverApi
}

export default useDriverApi
