import { defineDriver, kDeviceHasNoExtraCapabilities } from '../../services/drivers'
import { useSonyBvmProtocol } from '../../services/protocols/sonyBvm'

const sonyRs485Driver = defineDriver({
  enabled: true,
  experimental: false,
  kind: 'monitor',
  guid: '8626d6d3-c211-4d21-b5cc-f5e3b50d9ff0',
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
