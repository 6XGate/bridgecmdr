import { memo } from 'radash'
import { useIpc } from '../support'
import type { StartupApi } from '../api'

const useStartupApi = memo(function useStartupApi() {
  const ipc = useIpc()

  return {
    checkEnabled: ipc.useInvoke('startup:checkEnabled'),
    enable: ipc.useInvoke('startup:enable'),
    disable: ipc.useInvoke('startup:disable')
  } satisfies StartupApi
})

export default useStartupApi
