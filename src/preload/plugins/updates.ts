import { contextBridge } from 'electron'
import useIpc from '../support'
import type { AppUpdates } from '../api'

const useAppUpdates = (): AppUpdates => {
  const ipc = useIpc()

  const appUpdates = {
    checkForUpdates: ipc.useInvoke('update:check'),
    downloadUpdate: ipc.useInvoke('update:download'),
    cancelUpdate: ipc.useInvoke('update:cancel'),
    installUpdate: ipc.useInvoke('update:install'),
    onDownloadProgress: ipc.useAddListener('update:download:progress'),
    offDownloadProgress: ipc.useRemoveListener('update:download:progress')
  } satisfies AppUpdates

  contextBridge.exposeInMainWorld('appUpdates', appUpdates)

  return appUpdates
}

export default useAppUpdates
