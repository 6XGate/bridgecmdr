import { defineDriver, kDeviceSupportsMultipleOutputs } from '../../services/drivers'
import { useShinybowV2Protocol } from '../../services/protocols/shinybow'

const shinybowV2 = defineDriver({
  enabled: true,
  experimental: true,
  kind: 'switch',
  guid: '75fb7ed2-ee3a-46d5-b11f-7d8c3c208e7c',
  localized: {
    en: {
      title: 'Shinybow v2.0 compatible matrix switch',
      company: 'ShinybowUSA',
      provider: 'BridgeCmdr contributors'
    }
  },
  capabilities: kDeviceSupportsMultipleOutputs,
  setup: useShinybowV2Protocol
})

export default shinybowV2
