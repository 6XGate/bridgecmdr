import os from 'node:os'
import { app } from 'electron'
import { memo } from 'radash'

/** Basic user information. */
export type UserInfo = ReturnType<typeof useUserInfo>

const useUserInfo = memo(() => ({
  name: os.userInfo().username,
  locale: app.getLocale()
}))

export default useUserInfo
