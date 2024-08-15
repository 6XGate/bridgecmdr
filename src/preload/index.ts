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
  // Register services and setup to free all handles when the window closes.
  const services = useBridgedApi()
  globalThis.addEventListener('beforeunload', () => {
    services.freeAllHandles().catch((e: unknown) => {
      console.error(e)
    })
  })

  useAppUpdates()
  useAppInfo()
  useUserInfo()
} catch (e) {
  console.error('Preload error', e)
  process.exit(1)
}
