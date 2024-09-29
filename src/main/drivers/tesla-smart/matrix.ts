import Logger from 'electron-log'
import { createCommandStream } from '../../helpers/stream'
import { defineDriver, kDeviceSupportsMultipleOutputs } from '../../services/driver'

const teslaSmartMatrixDriver = defineDriver({
  enable: true,
  guid: '671824ED-0BC4-43A6-85CC-4877890A7722',
  localized: {
    en: {
      title: 'Tesla smart matrix-compatible switch',
      company: 'Tesla Elec Technology Co.,Ltd',
      provider: 'BridgeCmdr contributors'
    }
  },
  capabilities: kDeviceSupportsMultipleOutputs,
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
        Logger.debug(`teslaSmartMatrixDriver: return: ${String(data)}`)
      })
      connection.on('error', (error) => {
        Logger.error(`teslaSmartMatrixDriver: ${error.message}`)
      })

      await connection.write(command)
      await connection.close()
    }

    const toChannel = (n: number) => String(n).padStart(2, '0')

    const activate = async (inputChannel: number, outputChannel: number) => {
      Logger.log(`teslaSmartMatrixDriver.activate(${inputChannel}, ${outputChannel})`)
      const command = `MT00SW${toChannel(inputChannel)}${toChannel(outputChannel)}NT`
      await sendCommand(Buffer.from(command, 'ascii'))

      await Promise.resolve()
    }

    const powerOn = async () => {
      Logger.log('teslaSmartMatrixDriver.powerOn')
      Logger.debug('teslaSmartMatrixDriver.powerOn is a no-op')
      await Promise.resolve()
    }

    const powerOff = async () => {
      Logger.log('teslaSmartMatrixDriver.powerOff')
      Logger.debug('teslaSmartMatrixDriver.powerOff is a no-op')
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
