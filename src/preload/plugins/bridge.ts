import { contextBridge } from 'electron'
import useDriverApi from '@preload/plugins/driver'
import useLevelProxyApi from '@preload/plugins/level'
import usePortsApi from '@preload/plugins/ports'
import useStartupApi from '@preload/plugins/startup'
import useSystemApi from '@preload/plugins/system'
import type { BridgedApi } from '@preload/api'

const useBridgedApi = () => {
  const api = {
    startup: useStartupApi(),
    driver: useDriverApi(),
    ports: usePortsApi(),
    system: useSystemApi(),
    level: useLevelProxyApi()
  } satisfies BridgedApi

  contextBridge.exposeInMainWorld('api', api)

  return api
}

export default useBridgedApi
