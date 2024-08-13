/* eslint-disable n/no-process-exit -- No real way to do this otherwise */

// import process from 'node:process'

import useBridgedApi from './plugins/bridge.js'
import useAppInfo from './plugins/info/app.js'
import useUserInfo from './plugins/info/user.js'
import usePolyfills from './plugins/polyfill.js'
import useAppUpdates from './plugins/updates.js'

if (!process.contextIsolated) {
  console.error('Context isolation is not enabled')
  process.exit(1)
}

try {
  useBridgedApi()
  useAppUpdates()
  useAppInfo()
  useUserInfo()
  usePolyfills()
} catch (e) {
  console.error('Preload error', e)
  process.exit(1)
}
