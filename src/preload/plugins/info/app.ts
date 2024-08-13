import is from '@sindresorhus/is'
import { contextBridge } from 'electron'
import type { AppInfo } from '../../api.js'

const useAppInfo = () => {
  if (!is.nonEmptyString(process.env['app_name_'])) throw new ReferenceError('Missing appInfo.name')
  if (!is.nonEmptyString(process.env['app_version_'])) throw new ReferenceError('Missing appInfo.version')

  const appInfo = {
    name: process.env['app_name_'],
    version: process.env['app_version_'] as AppInfo['version']
  } satisfies AppInfo

  contextBridge.exposeInMainWorld('app', appInfo)

  return appInfo
}

export default useAppInfo
