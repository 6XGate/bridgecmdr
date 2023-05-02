import { contextBridge } from 'electron'
import type { UserInfo } from '@preload/api'

const useUserInfo = () => {
  const userInfo = {
    name: process.env['USER'] as string,
    locale: process.env['user_locale_'] as string
  } satisfies UserInfo

  contextBridge.exposeInMainWorld('user', userInfo)

  return userInfo
}

export default useUserInfo
