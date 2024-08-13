import useIpc from '../support.js'
import type { StartupApi } from '../api.js'

const useStartupApi = () => {
  const ipc = useIpc()

  return {
    checkEnabled: ipc.useInvoke('startup:checkEnabled'),
    enable: ipc.useInvoke('startup:enable'),
    disable: ipc.useInvoke('startup:disable')
  } satisfies StartupApi
}

export default useStartupApi
