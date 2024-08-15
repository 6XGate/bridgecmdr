import { contextBridge } from 'electron'
import useIpc from '../support'
import useDriverApi from './driver'
import useLevelApi from './level'
import usePortsApi from './ports'
import useStartupApi from './startup'
import useSystemApi from './system'
import type { MainProcessServices } from '../api'

const useBridgedApi = () => {
  const ipc = useIpc()

  const services = {
    startup: useStartupApi(),
    driver: useDriverApi(),
    ports: usePortsApi(),
    system: useSystemApi(),
    level: useLevelApi(),
    env: { ...process.env },
    freeHandle: ipc.useInvoke('handle:free'),
    freeAllHandles: ipc.useInvoke('handle:clean')
  } satisfies MainProcessServices

  contextBridge.exposeInMainWorld('services', services)

  return services
}

export default useBridgedApi
