/* eslint-disable n/no-process-exit -- No real way to do this otherwise */

// import process from 'node:process'

import useBridgedApi from './plugins/bridge'
import useAppInfo from './plugins/info/app'
import useUserInfo from './plugins/info/user'
import useAppUpdates from './plugins/updates'

if (!process.contextIsolated) {
  console.error('Context isolation is not enabled')
  process.exit(1)
}

try {
  useBridgedApi()
  useAppUpdates()
  useAppInfo()
  useUserInfo()
} catch (e) {
  console.error('Preload error', e)
  process.exit(1)
}
