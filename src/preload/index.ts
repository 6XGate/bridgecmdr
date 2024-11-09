/* eslint-disable n/no-process-exit -- No real way to do this otherwise */

if (!process.contextIsolated) {
  console.error('Context isolation is not enabled')
  process.exit(1)
}
