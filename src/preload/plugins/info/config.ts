import is from '@sindresorhus/is'
import { contextBridge } from 'electron'
import { memo } from 'radash'
import type { AppConfig } from '../../api'

const useAppConfig = memo(function useAppConfig() {
  if (!is.nonEmptyString(process.env['rpc_url_'])) throw new ReferenceError('Missing appConfig.rpcUrl')

  const appConfig = {
    rpcUrl: process.env['rpc_url_']
  } satisfies AppConfig

  contextBridge.exposeInMainWorld('configuration', appConfig)

  return appConfig
})

export default useAppConfig
