import Logger from 'electron-log'
import { defineDriver, kDeviceHasNoExtraCapabilities } from '../../services/drivers'
import { createCommandStream } from '../../services/stream'

const teslaSmartKvmDriver = defineDriver({
  enabled: true,
  guid: '91D5BC95-A8E2-4F58-BCAC-A77BA1054D61',
  localized: {
    en: {
      title: 'Tesla smart KVM-compatible switch',
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
        Logger.debug(`teslaSmartKvmDriver: return: ${String(data)}`)
      })
      connection.on('error', (error) => {
        Logger.error(`teslaSmartKvmDriver: ${error.message}`)
      })

      await connection.write(command)
      await connection.close()
    }

    async function activate(uri: string, input: number) {
      Logger.log(`teslaSmartKvmDriver.activate(${input})`)
      await sendCommand(uri, Buffer.of(0xaa, 0xbb, 0x03, 0x01, input, 0xee))
    }

    async function powerOn() {
      Logger.log('teslaSmartKvmDriver.powerOn')
      Logger.debug('teslaSmartKvmDriver.powerOn is a no-op')
      await Promise.resolve()
    }

    async function powerOff() {
      Logger.log('teslaSmartKvmDriver.powerOff')
      Logger.debug('teslaSmartKvmDriver.powerOff is a no-op')
      await Promise.resolve()
    }

    return {
      activate,
      powerOn,
      powerOff
    }
  }
})

export default teslaSmartKvmDriver
