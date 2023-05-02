import { contextBridge } from 'electron'
import type { AppInfo } from '@preload/api'

const useAppInfo = () => {
  const appInfo = {
    name: process.env['app_name_'] as string,
    version: process.env['app_version_'] as AppInfo['version']
  } satisfies AppInfo

  contextBridge.exposeInMainWorld('app', appInfo)

  return appInfo
}

export default useAppInfo
