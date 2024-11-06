import { defineDriver, kDeviceHasNoExtraCapabilities } from '../../services/drivers'
import { useTeslaElecKvmProtocol } from '../../services/protocols/teslaElec'

const teslaSmartKvmDriver = defineDriver({
  enabled: true,
  experimental: true,
  kind: 'switch',
  guid: '91D5BC95-A8E2-4F58-BCAC-A77BA1054D61',
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
