import { defineDriver, kDeviceHasNoExtraCapabilities } from '../../services/drivers'
import { useTeslaElecKvmProtocol } from '../../services/protocols/teslaElec'

const tesmartKvmDriver = defineDriver({
  enabled: true,
  experimental: true,
  kind: 'switch',
  guid: '2B4EDB8E-D2D6-4809-BA18-D5B1785DA028',
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
