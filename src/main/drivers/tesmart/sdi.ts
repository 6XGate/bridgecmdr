import { defineDriver, kDeviceHasNoExtraCapabilities } from '../../services/drivers'
import { useTeslaElecSdiProtocol } from '../../services/protocols/teslaElec'

const tesmartSdiDriver = defineDriver({
  enabled: true,
  experimental: true,
  kind: 'switch',
  guid: '8C524E65-83EF-4AEF-B0DA-29C4582AA4A0',
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
