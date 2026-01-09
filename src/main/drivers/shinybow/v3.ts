import { defineDriver, kDeviceSupportsMultipleOutputs } from '../../services/drivers'
import { useShinybowV3Protocol } from '../../services/protocols/shinybow'

const shinybowV3 = defineDriver({
  enabled: true,
  experimental: true,
  kind: 'switch',
  guid: 'bbed08a1-c749-4733-8f2e-96c9b56c0c41',
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
