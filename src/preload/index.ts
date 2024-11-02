/* eslint-disable n/no-process-exit -- No real way to do this otherwise */

import useAppConfig from './plugins/info/config'

if (!process.contextIsolated) {
  console.error('Context isolation is not enabled')
  process.exit(1)
}

try {
  useAppConfig()
} catch (e) {
  console.error('Preload error', e)
  process.exit(1)
}
