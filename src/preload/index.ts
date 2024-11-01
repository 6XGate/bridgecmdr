/* eslint-disable n/no-process-exit -- No real way to do this otherwise */

import useAppConfig from './plugins/info/config'
import useServices from './plugins/services'

if (!process.contextIsolated) {
  console.error('Context isolation is not enabled')
  process.exit(1)
}

try {
  // Register services and setup to free all handles when the window closes.
  useServices()

  useAppConfig()
} catch (e) {
  console.error('Preload error', e)
  process.exit(1)
}
