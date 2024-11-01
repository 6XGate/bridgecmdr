import { contextBridge } from 'electron'
import { memo } from 'radash'
import { useIpc } from '../support'
import useDriverApi from './services/driver'
import useProcessData from './services/process'
import useStartupApi from './services/startup'
import useSystemApi from './services/system'
import useAppUpdates from './services/updates'
import type { MainProcessServices } from '../api'

const useServices = memo(function useServices() {
  const ipc = useIpc()

  const services = {
    process: useProcessData(),
    driver: useDriverApi(),
    startup: useStartupApi(),
    system: useSystemApi(),
    updates: useAppUpdates(),
    freeHandle: ipc.useInvoke('handle:free'),
    freeAllHandles: ipc.useInvoke('handle:clean')
  } satisfies MainProcessServices

  contextBridge.exposeInMainWorld('services', services)

  return services
})

export default useServices
