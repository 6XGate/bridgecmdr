import Logger from 'electron-log'
import { defineDriver, kDeviceHasNoExtraCapabilities } from '../../services/drivers'
import { createCommandStream } from '../../services/stream'

const teslaSmartSdiDriver = defineDriver({
  enabled: true,
  experimental: true,
  guid: 'DDB13CBC-ABFC-405E-9EA6-4A999F9A16BD',
  localized: {
    en: {
      title: 'Tesla smart SDI-compatible switch',
      company: 'Tesla Elec Technology Co.,Ltd',
      provider: 'BridgeCmdr contributors'
    }
  },
  capabilities: kDeviceHasNoExtraCapabilities,
  setup: () => {
    async function sendCommand(uri: string, command: Buffer) {
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

    async function activate(uri: string, input: number) {
      Logger.log(`teslaSmartSdiDriver.activate(${input})`)
      await sendCommand(uri, Buffer.of(0xaa, 0xcc, 0x01, input))
    }

    async function powerOn() {
      Logger.log('teslaSmartSdiDriver.powerOn')
      Logger.debug('teslaSmartSdiDriver.powerOn is a no-op')
      await Promise.resolve()
    }

    async function powerOff() {
      Logger.log('teslaSmartSdiDriver.powerOff')
      Logger.debug('teslaSmartSdiDriver.powerOff is a no-op')
      await Promise.resolve()
    }

    return {
      activate,
      powerOn,
      powerOff
    }
  }
})

export default teslaSmartSdiDriver
