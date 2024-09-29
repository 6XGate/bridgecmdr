import { contextBridge } from 'electron'
import useIpc from '../support'
import useDriverApi from './driver'
import { useProcessData } from './info/process'
import useLevelApi from './level'
import usePortsApi from './ports'
import useStartupApi from './startup'
import useSystemApi from './system'
import useAppUpdates from './updates'
import type { MainProcessServices } from '../api'

const useServices = () => {
  const ipc = useIpc()

  const services = {
    process: useProcessData(),
    driver: useDriverApi(),
    level: useLevelApi(),
    ports: usePortsApi(),
    startup: useStartupApi(),
    system: useSystemApi(),
    updates: useAppUpdates(),
    freeHandle: ipc.useInvoke('handle:free'),
    freeAllHandles: ipc.useInvoke('handle:clean')
  } satisfies MainProcessServices

  contextBridge.exposeInMainWorld('services', services)

  return services
}

export default useServices
