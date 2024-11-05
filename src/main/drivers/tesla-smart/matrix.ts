import { defineDriver, kDeviceSupportsMultipleOutputs } from '../../services/drivers'
import { useTeslaElecMatrixProtocol } from '../../services/protocols/teslaElec'

const teslaSmartMatrixDriver = defineDriver({
  enabled: true,
  experimental: true,
  kind: 'switch',
  guid: '671824ED-0BC4-43A6-85CC-4877890A7722',
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
