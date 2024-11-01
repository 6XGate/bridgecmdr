import { memo } from 'radash'
import type { ReadonlyDeep } from 'type-fest'

export type AppConfig = ReadonlyDeep<ReturnType<typeof useAppConfig>>
const useAppConfig = memo(function useAppConfig() {
  const config = {
    rpcUrl: 'http://127.0.0.1:7180'
  }

  process.env['rpc_url_'] = config.rpcUrl

  return config
})

export default useAppConfig
