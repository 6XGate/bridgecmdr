import { app } from 'electron'
import { memo } from 'radash'

/** Basic application information. */
export type AppInfo = ReturnType<typeof useAppInfo>

const useAppInfo = memo(() => ({
  name: app.getName(),
  version: app.getVersion() as `${number}.${number}.${number}`
}))

export default useAppInfo
