import useIpc from '../support.js'
import type { SystemApi } from '../api.js'

const useSystemApi = () => {
  const ipc = useIpc()

  return {
    powerOff: ipc.useInvoke('system:powerOff')
  } satisfies SystemApi
}

export default useSystemApi
