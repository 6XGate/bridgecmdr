import log from 'electron-log'
import { defineDriver, kDeviceSupportsMultipleOutputs } from '@main/system/driver'

const teslaSmartMatrixDriver = defineDriver({
  enable: false,
  guid: '671824ED-0BC4-43A6-85CC-4877890A7722',
  localized: {
    en: {
      title: 'Tesla smart matrix-compatible switch',
      company: 'Tesla Elec Technology Co.,Ltd',
      provider: 'BridgeCmdr contributors'
    }
  },
  capabilities: kDeviceSupportsMultipleOutputs,
  setup: async _uri => {
    const activate = async (inputChannel: number) => {
      log.log(`Tesla smart matrix: ${inputChannel}`)
      await Promise.resolve()
    }

    const powerOn = async () => {
      log.log('Tesla smart matrix: Power On')
      await Promise.resolve()
    }

    const powerOff = async () => {
      log.log('Tesla smart matrix: Power On')
      await Promise.resolve()
    }

    return await Promise.resolve({
      activate,
      powerOn,
      powerOff
    })
  }

})

export default teslaSmartMatrixDriver
