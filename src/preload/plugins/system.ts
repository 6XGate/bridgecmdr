import useIpc from '@preload/support'
import type { SystemApi } from '@preload/api'

const useSystemApi = () => {
  const ipc = useIpc()

  return {
    powerOff: ipc.useInvoke('system:powerOff')
  } satisfies SystemApi
}

export default useSystemApi
