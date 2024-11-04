import { defineDriver, kDeviceSupportsMultipleOutputs } from '../../services/drivers'
import { useTeslaElecMatrixProtocol } from '../../services/protocols/teslaElec'

const tesmartMatrixDriver = defineDriver({
  enabled: true,
  experimental: true,
  guid: '01B8884C-1D7D-4451-883D-3C8F18E17B14',
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
