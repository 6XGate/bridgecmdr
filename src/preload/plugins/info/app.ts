import is from '@sindresorhus/is'
import { contextBridge } from 'electron'
import type { AppInfo } from '../../api'

const useAppInfo = () => {
  if (!is.nonEmptyString(process.env['app_name_'])) throw new ReferenceError('Missing appInfo.name')
  if (!is.nonEmptyString(process.env['app_version_'])) throw new ReferenceError('Missing appInfo.version')

  const appInfo = {
    name: process.env['app_name_'],
    version: process.env['app_version_'] as AppInfo['version']
  } satisfies AppInfo

  contextBridge.exposeInMainWorld('application', appInfo)

  return appInfo
}

export default useAppInfo
