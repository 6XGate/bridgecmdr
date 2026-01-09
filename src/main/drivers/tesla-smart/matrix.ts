import { defineDriver, kDeviceSupportsMultipleOutputs } from '../../services/drivers'
import { useTeslaElecMatrixProtocol } from '../../services/protocols/teslaElec'

const teslaSmartMatrixDriver = defineDriver({
  enabled: true,
  experimental: true,
  kind: 'switch',
  guid: '671824ed-0bc4-43a6-85cc-4877890a7722',
  localized: {
    en: {
      title: 'Tesla smart matrix-compatible switch',
      company: 'Tesla Elec Technology Co.,Ltd',
      provider: 'BridgeCmdr contributors'
    }
  },
  capabilities: kDeviceSupportsMultipleOutputs,
  setup: useTeslaElecMatrixProtocol
})

export default teslaSmartMatrixDriver
