import useIpc from '../support.js'
import type { PortApi } from '../api.js'

const usePortsApi = () => {
  const ipc = useIpc()

  return {
    list: ipc.useInvoke('ports:list')
  } satisfies PortApi
}

export default usePortsApi
