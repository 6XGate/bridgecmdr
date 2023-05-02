import useIpc from '@preload/support'
import type { PortApi } from '@preload/api'

const usePortsApi = () => {
  const ipc = useIpc()

  return {
    list: ipc.useInvoke('ports:list')
  } satisfies PortApi
}

export default usePortsApi
