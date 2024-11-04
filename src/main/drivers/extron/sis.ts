import { defineDriver, kDeviceCanDecoupleAudioOutput, kDeviceSupportsMultipleOutputs } from '../../services/drivers'
import { useExtronSisProtocol } from '../../services/protocols/extronSis'

const extronSisDriver = defineDriver({
  enabled: true,
  experimental: false,
  guid: '4C8F2838-C91D-431E-84DD-3666D14A6E2C',
  localized: {
    en: {
      title: 'Extron SIS-compatible matrix switch',
      company: 'Extron Electronics',
      provider: 'BridgeCmdr contributors'
    }
  },
  capabilities: kDeviceSupportsMultipleOutputs | kDeviceCanDecoupleAudioOutput,
  setup: useExtronSisProtocol
})

export default extronSisDriver
