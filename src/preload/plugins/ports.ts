import { memo } from 'radash'
import { useIpc } from '../support'
import type { PortApi } from '../api'

const usePortsApi = memo(function usePortsApi() {
  const ipc = useIpc()

  return {
    list: ipc.useInvoke('ports:list')
  } satisfies PortApi
})

export default usePortsApi
