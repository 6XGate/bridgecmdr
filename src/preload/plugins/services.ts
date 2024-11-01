import { contextBridge } from 'electron'
import { memo } from 'radash'
import useProcessData from './services/process'
import useSystemApi from './services/system'
import useAppUpdates from './services/updates'
import type { MainProcessServices } from '../api'

const useServices = memo(function useServices() {
  const services = {
    process: useProcessData(),
    system: useSystemApi(),
    updates: useAppUpdates()
  } satisfies MainProcessServices

  contextBridge.exposeInMainWorld('services', services)

  return services
})

export default useServices
