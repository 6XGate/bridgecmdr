import { defineDriver, kDeviceSupportsMultipleOutputs } from '../../services/drivers'
import { useTeslaElecMatrixProtocol } from '../../services/protocols/teslaElec'

const tesmartMatrixDriver = defineDriver({
  enabled: true,
  experimental: true,
  kind: 'switch',
  guid: '01b8884c-1d7d-4451-883d-3c8f18e17b14',
  localized: {
    en: {
      title: 'TESmart matrix-compatible switch',
      company: 'Tesla Elec Technology Co.,Ltd',
      provider: 'BridgeCmdr contributors'
    }
  },
  capabilities: kDeviceSupportsMultipleOutputs,
  setup: useTeslaElecMatrixProtocol
})

export default tesmartMatrixDriver
