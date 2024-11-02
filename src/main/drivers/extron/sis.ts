import Logger from 'electron-log'
import { defineDriver, kDeviceCanDecoupleAudioOutput, kDeviceSupportsMultipleOutputs } from '../../services/drivers'
import { createCommandStream } from '../../services/stream'

const extronSisDriver = defineDriver({
  enabled: true,
  guid: '4C8F2838-C91D-431E-84DD-3666D14A6E2C',
  localized: {
    en: {
      title: 'Extron SIS-compatible matrix switch',
      company: 'Extron Electronics',
      provider: 'BridgeCmdr contributors'
    }
  },
  capabilities: kDeviceSupportsMultipleOutputs | kDeviceCanDecoupleAudioOutput,
  setup: () => {
    async function sendCommand(uri: string, command: string) {
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
        Logger.debug(`extronSisDriver: return: ${String(data)}`)
      })
      connection.on('error', (error) => {
        Logger.error(`extronSisDriver: ${error.message}`)
      })

      await connection.write(command)
      await connection.close()
    }

    async function activate(uri: string, input: number, videoOutput: number, audioOutput: number) {
      Logger.log(`extronSisDriver.activate(${input}, ${videoOutput}, ${audioOutput})`)
      const videoCommand = `${input}*${videoOutput}%`
      const audioCommand = `${input}*${audioOutput}$`
      await sendCommand(uri, `${videoCommand}\r\n${audioCommand}\r\n`)
    }

    async function powerOn() {
      Logger.log('extronSisDriver.powerOn')
      Logger.debug('extronSisDriver.powerOn is a no-op')
      await Promise.resolve()
    }

    async function powerOff() {
      Logger.log('extronSisDriver.powerOff')
      Logger.debug('extronSisDriver.powerOff is a no-op')
      await Promise.resolve()
    }

    return {
      activate,
      powerOn,
      powerOff
    }
  }
})

export default extronSisDriver
