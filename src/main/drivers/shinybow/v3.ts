import { defineDriver, kDeviceSupportsMultipleOutputs } from '../../services/drivers'
import { useShinybowV3Protocol } from '../../services/protocols/shinybow'

const shinybowV3 = defineDriver({
  enabled: true,
  experimental: true,
  guid: 'BBED08A1-C749-4733-8F2E-96C9B56C0C41',
  localized: {
    en: {
      title: 'Shinybow v3.0 compatible matrix switch',
      company: 'ShinybowUSA',
      provider: 'BridgeCmdr contributors'
    }
  },
  capabilities: kDeviceSupportsMultipleOutputs,
  setup: useShinybowV3Protocol
})

export default shinybowV3
