import Logger from 'electron-log'
import { createCommandStream } from '../../helpers/stream.js'
import { defineDriver, kDeviceHasNoExtraCapabilities } from '../../system/driver.js'

const teslaSmartKvmDriver = defineDriver({
  enable: true,
  guid: '91D5BC95-A8E2-4F58-BCAC-A77BA1054D61',
  localized: {
    en: {
      title: 'Tesla smart KVM-compatible switch',
      company: 'Tesla Elec Technology Co.,Ltd',
      provider: 'BridgeCmdr contributors'
    }
  },
  capabilities: kDeviceHasNoExtraCapabilities,
  setup: async uri => {
    const sendCommand = async (command: Buffer) => {
      const connection = await createCommandStream(uri, {
        baudRate: 9600,
        timeout: 5000,
        keepAlive: true
      })

      // TODO: Other situation handlers...
      connection.on('data', data => {
        Logger.debug(`teslaSmartKvmDriver: return: ${String(data)}`)
      })
      connection.on('error', error => {
        Logger.error(`teslaSmartKvmDriver: ${error.message}`)
      })

      await connection.write(command)
      await connection.close()
    }

    const activate = async (inputChannel: number) => {
      Logger.log(`teslaSmartKvmDriver.activate(${inputChannel})`)
      await sendCommand(Buffer.of(0xaa, 0xbb, 0x03, 0x01, inputChannel, 0xee))
    }

    const powerOn = async () => {
      Logger.log('teslaSmartKvmDriver.powerOn')
      Logger.debug('teslaSmartKvmDriver.powerOn is a no-op')
      await Promise.resolve()
    }

    const powerOff = async () => {
      Logger.log('teslaSmartKvmDriver.powerOff')
      Logger.debug('teslaSmartKvmDriver.powerOff is a no-op')
      await Promise.resolve()
    }

    return await Promise.resolve({
      activate,
      powerOn,
      powerOff
    })
  }
})

export default teslaSmartKvmDriver
