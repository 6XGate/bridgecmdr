/* eslint-disable n/no-process-exit -- No real way to do this otherwise */

import useAppInfo from './plugins/info/app'
import useUserInfo from './plugins/info/user'
import useServices from './plugins/services'

if (!process.contextIsolated) {
  console.error('Context isolation is not enabled')
  process.exit(1)
}

try {
  // Register services and setup to free all handles when the window closes.
  const services = useServices()
  globalThis.addEventListener('beforeunload', () => {
    services.freeAllHandles().catch((e: unknown) => {
      console.error(e)
    })
  })

  useAppInfo()
  useUserInfo()
} catch (e) {
  console.error('Preload error', e)
  process.exit(1)
}
