import { defineDriver, kDeviceHasNoExtraCapabilities } from '../../services/drivers'
import { useTeslaElecKvmProtocol } from '../../services/protocols/teslaElec'

const teslaSmartKvmDriver = defineDriver({
  enabled: true,
  experimental: true,
  kind: 'switch',
  guid: '91d5bc95-a8e2-4f58-bcac-a77ba1054d61',
  localized: {
    en: {
      title: 'Tesla smart KVM-compatible switch',
      company: 'Tesla Elec Technology Co.,Ltd',
      provider: 'BridgeCmdr contributors'
    }
  },
  capabilities: kDeviceHasNoExtraCapabilities,
  setup: useTeslaElecKvmProtocol
})

export default teslaSmartKvmDriver
