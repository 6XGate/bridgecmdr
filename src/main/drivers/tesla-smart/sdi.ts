import { defineDriver, kDeviceHasNoExtraCapabilities } from '../../services/drivers'
import { useTeslaElecSdiProtocol } from '../../services/protocols/teslaElec'

const teslaSmartSdiDriver = defineDriver({
  enabled: true,
  experimental: true,
  guid: 'DDB13CBC-ABFC-405E-9EA6-4A999F9A16BD',
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
