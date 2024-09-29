import Logger from 'electron-log'
import { createCommandStream } from '../../helpers/stream'
import { defineDriver, kDeviceHasNoExtraCapabilities } from '../../system/driver'

const teslaSmartSdiDriver = defineDriver({
  enable: true,
  guid: 'DDB13CBC-ABFC-405E-9EA6-4A999F9A16BD',
  localized: {
    en: {
      title: 'Tesla smart SDI-compatible switch',
      company: 'Tesla Elec Technology Co.,Ltd',
      provider: 'BridgeCmdr contributors'
    }
  },
  capabilities: kDeviceHasNoExtraCapabilities,
  setup: async (uri) => {
    const sendCommand = async (command: Buffer) => {
      const connection = await createCommandStream(uri, {
        baudRate: 9600,
        dataBits: 8,
        stopBits: 1,
        parity: 'none',
        timeout: 5000,
        keepAlive: true
      })

      // TODO: Other situation handlers...
      connection.on('data', (data) => {
        Logger.debug(`teslaSmartSdiDriver: return: ${String(data)}`)
      })
      connection.on('error', (error) => {
        Logger.error(`teslaSmartSdiDriver: ${error.message}`)
      })

      await connection.write(command)
      await connection.close()
    }

    const activate = async (inputChannel: number) => {
      Logger.log(`teslaSmartSdiDriver.activate(${inputChannel})`)
      await sendCommand(Buffer.of(0xaa, 0xcc, 0x01, inputChannel))
    }

    const powerOn = async () => {
      Logger.log('teslaSmartSdiDriver.powerOn')
      Logger.debug('teslaSmartSdiDriver.powerOn is a no-op')
      await Promise.resolve()
    }

    const powerOff = async () => {
      Logger.log('teslaSmartSdiDriver.powerOff')
      Logger.debug('teslaSmartSdiDriver.powerOff is a no-op')
      await Promise.resolve()
    }

    return await Promise.resolve({
      activate,
      powerOn,
      powerOff
    })
  }
})

export default teslaSmartSdiDriver
