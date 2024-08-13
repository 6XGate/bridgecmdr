import type { AppInfo } from '../../preload/api'

const useAppInfo = (): AppInfo => globalThis.app

export default useAppInfo
