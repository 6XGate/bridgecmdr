import type { BridgedApi } from '../../preload/api'

const useBridgedApi = (): BridgedApi => globalThis.api

export default useBridgedApi
