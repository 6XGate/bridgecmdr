import { defineDriver, kDeviceHasNoExtraCapabilities } from '../../services/drivers'
import { useTeslaElecSdiProtocol } from '../../services/protocols/teslaElec'

const tesmartSdiDriver = defineDriver({
  enabled: true,
  experimental: true,
  kind: 'switch',
  guid: '8c524e65-83ef-4aef-b0da-29c4582aa4a0',
  localized: {
    en: {
      title: 'TESmart SDI-compatible switch',
      company: 'Tesla Elec Technology Co.,Ltd',
      provider: 'BridgeCmdr contributors'
    }
  },
  capabilities: kDeviceHasNoExtraCapabilities,
  setup: useTeslaElecSdiProtocol
})

export default tesmartSdiDriver
