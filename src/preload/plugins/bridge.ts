import { contextBridge } from 'electron'
import useIpc from '../support'
import useDriverApi from './driver'
import useLevelApi from './level'
import usePortsApi from './ports'
import useStartupApi from './startup'
import useSystemApi from './system'
import type { BridgedApi } from '../api'

const useBridgedApi = () => {
  const ipc = useIpc()

  const api = {
    startup: useStartupApi(),
    driver: useDriverApi(),
    ports: usePortsApi(),
    system: useSystemApi(),
    level: useLevelApi(),
    env: { ...process.env },
    freeHandle: ipc.useInvoke('handle:free'),
    freeAllHandles: ipc.useInvoke('handle:clean')
  } satisfies BridgedApi

  contextBridge.exposeInMainWorld('api', api)

  return api
}

export default useBridgedApi
