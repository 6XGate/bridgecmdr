import Logger from 'electron-log'
import { defineDriver, kDeviceSupportsMultipleOutputs } from '../../services/drivers'
import { createCommandStream } from '../../services/stream'

const teslaSmartMatrixDriver = defineDriver({
  enabled: true,
  guid: '671824ED-0BC4-43A6-85CC-4877890A7722',
  localized: {
    en: {
      title: 'Tesla smart matrix-compatible switch',
      company: 'Tesla Elec Technology Co.,Ltd',
      provider: 'BridgeCmdr contributors'
    }
  },
  capabilities: kDeviceSupportsMultipleOutputs,
  setup: () => {
    const sendCommand = async (uri: string, command: Buffer) => {
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
        Logger.debug(`teslaSmartMatrixDriver: return: ${String(data)}`)
      })
      connection.on('error', (error) => {
        Logger.error(`teslaSmartMatrixDriver: ${error.message}`)
      })

      await connection.write(command)
      await connection.close()
    }

    const toChannel = (n: number) => String(n).padStart(2, '0')

    async function activate(uri: string, input: number, output: number) {
      Logger.log(`teslaSmartMatrixDriver.activate(${input}, ${output})`)
      const command = `MT00SW${toChannel(input)}${toChannel(output)}NT`
      await sendCommand(uri, Buffer.from(command, 'ascii'))

      await Promise.resolve()
    }

    async function powerOn() {
      Logger.log('teslaSmartMatrixDriver.powerOn')
      Logger.debug('teslaSmartMatrixDriver.powerOn is a no-op')
      await Promise.resolve()
    }

    async function powerOff() {
      Logger.log('teslaSmartMatrixDriver.powerOff')
      Logger.debug('teslaSmartMatrixDriver.powerOff is a no-op')
      await Promise.resolve()
    }

    return {
      activate,
      powerOn,
      powerOff
    }
  }
})

export default teslaSmartMatrixDriver
