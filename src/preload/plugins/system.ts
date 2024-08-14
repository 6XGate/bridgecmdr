import useIpc from '../support'
import type { SystemApi } from '../api'

const useSystemApi = () => {
  const ipc = useIpc()

  return {
    powerOff: ipc.useInvoke('system:powerOff')
  } satisfies SystemApi
}

export default useSystemApi
