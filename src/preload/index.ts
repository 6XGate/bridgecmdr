// import process from 'node:process'
import useBridgedApi from '@preload/plugins/bridge'
import useAppInfo from '@preload/plugins/info/app'
import useUserInfo from '@preload/plugins/info/user'
import usePolyfills from '@preload/plugins/polyfill'
import useAppUpdates from '@preload/plugins/updates'

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
} catch (error) {
  console.error(error)
  process.exit(1)
}
