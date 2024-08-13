import { contextBridge } from 'electron'
import useIpc from '../support.js'
import useDriverApi from './driver.js'
import useLevelApi from './level.js'
import usePortsApi from './ports.js'
import useStartupApi from './startup.js'
import useSystemApi from './system.js'
import type { BridgedApi } from '../api.js'

const useBridgedApi = () => {
  const ipc = useIpc()

  const api = {
    startup: useStartupApi(),
    driver: useDriverApi(),
    ports: usePortsApi(),
    system: useSystemApi(),
    level: useLevelApi(),
    freeHandle: ipc.useInvoke('handle:free'),
    freeAllHandles: ipc.useInvoke('handle:clean')
  } satisfies BridgedApi

  contextBridge.exposeInMainWorld('api', api)

  return api
}

export default useBridgedApi
