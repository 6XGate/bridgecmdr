import { defineDriver, kDeviceHasNoExtraCapabilities } from '../../services/drivers'
import { useSonyBvmProtocol } from '../../services/protocols/sonyBvm'

const sonyRs485Driver = defineDriver({
  enabled: true,
  experimental: false,
  kind: 'monitor',
  guid: '8626D6D3-C211-4D21-B5CC-F5E3B50D9FF0',
  localized: {
    en: {
      title: 'Sony RS-485 controllable monitor',
      company: 'Sony Corporation',
      provider: 'BridgeCmdr contributors'
    }
  },
  capabilities: kDeviceHasNoExtraCapabilities,
  setup: useSonyBvmProtocol
})

export default sonyRs485Driver
