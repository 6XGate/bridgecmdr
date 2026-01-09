import { defineDriver, kDeviceCanDecoupleAudioOutput, kDeviceSupportsMultipleOutputs } from '../../services/drivers'
import { useExtronSisProtocol } from '../../services/protocols/extronSis'

const extronSisDriver = defineDriver({
  enabled: true,
  experimental: false,
  kind: 'switch',
  guid: '4c8f2838-c91d-431e-84dd-3666d14a6e2c',
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
