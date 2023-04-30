import type { BridgedApi } from '@preload/api'

const useBridgedApi = (): BridgedApi => window.api

export default useBridgedApi
