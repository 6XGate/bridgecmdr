import { defineDriver, kDeviceHasNoExtraCapabilities } from '../../services/drivers'
import { useTeslaElecKvmProtocol } from '../../services/protocols/teslaElec'

const tesmartKvmDriver = defineDriver({
  enabled: true,
  experimental: true,
  kind: 'switch',
  guid: '2b4edb8e-d2d6-4809-ba18-d5b1785da028',
  localized: {
    en: {
      title: 'TESmart KVM-compatible switch',
      company: 'Tesla Elec Technology Co.,Ltd',
      provider: 'BridgeCmdr contributors'
    }
  },
  capabilities: kDeviceHasNoExtraCapabilities,
  setup: useTeslaElecKvmProtocol
})

export default tesmartKvmDriver
