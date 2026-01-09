import { defineDriver, kDeviceHasNoExtraCapabilities } from '../../services/drivers'
import { useTeslaElecSdiProtocol } from '../../services/protocols/teslaElec'

const teslaSmartSdiDriver = defineDriver({
  enabled: true,
  experimental: true,
  kind: 'switch',
  guid: 'ddb13cbc-abfc-405e-9ea6-4a999f9a16bd',
  localized: {
    en: {
      title: 'Tesla smart SDI-compatible switch',
      company: 'Tesla Elec Technology Co.,Ltd',
      provider: 'BridgeCmdr contributors'
    }
  },
  capabilities: kDeviceHasNoExtraCapabilities,
  setup: useTeslaElecSdiProtocol
})

export default teslaSmartSdiDriver
