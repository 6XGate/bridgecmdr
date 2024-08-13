import is from '@sindresorhus/is'
import { contextBridge } from 'electron'
import type { UserInfo } from '../../api.js'

const useUserInfo = () => {
  if (!is.nonEmptyString(process.env['USER'])) throw new ReferenceError('Missing user info')
  if (!is.nonEmptyString(process.env['user_locale_'])) throw new ReferenceError('Missing locale info')

  const userInfo = {
    name: process.env['USER'],
    locale: process.env['user_locale_']
  } satisfies UserInfo

  contextBridge.exposeInMainWorld('user', userInfo)

  return userInfo
}

export default useUserInfo
