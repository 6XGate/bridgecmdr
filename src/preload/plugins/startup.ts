import useIpc from '@preload/support'
import type { StartupApi } from '@preload/api'

const useStartupApi = () => {
  const ipc = useIpc()

  return {
    checkEnabled: ipc.useInvoke('startup:checkEnabled'),
    enable: ipc.useInvoke('startup:enable'),
    disable: ipc.useInvoke('startup:disable')
  } satisfies StartupApi
}

export default useStartupApi
