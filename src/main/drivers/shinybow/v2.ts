import { defineDriver, kDeviceSupportsMultipleOutputs } from '../../services/drivers'
import { useShinybowV2Protocol } from '../../services/protocols/shinybow'

const shinybowV2 = defineDriver({
  enabled: true,
  experimental: true,
  kind: 'switch',
  guid: '75FB7ED2-EE3A-46D5-B11F-7D8C3C208E7C',
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
