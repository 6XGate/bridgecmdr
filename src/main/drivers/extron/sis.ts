import useCommandStream from '@main/helpers/stream'
import useLogging from '@main/plugins/log'
import { defineDriver, kDeviceCanDecoupleAudioOutput, kDeviceSupportsMultipleOutputs } from '@main/system/driver'

const extronSisDriver = defineDriver({
  enable: true,
  guid: '4C8F2838-C91D-431E-84DD-3666D14A6E2C',
  localized: {
    en: {
      title: 'Extron SIS-compatible matrix switch',
      company: 'Extron Electronics',
      provider: 'BridgeCmdr contributors'
    }
  },
  capabilities: kDeviceSupportsMultipleOutputs | kDeviceCanDecoupleAudioOutput,
  setup: async uri => {
    const log = useLogging()
    const createCommandStream = useCommandStream()

    const sendCommand = async (command: string) => {
      const connection = await createCommandStream(uri, {
        baudRate: 9600,
        timeout: 5000,
        keepAlive: true
      })

      // TODO: Other situation handlers...
      connection.on('data', data => { log.debug(`extronSisDriver: return: ${String(data)}`) })
      connection.on('error', error => { log.error(`extronSisDriver: ${error.message}`) })

      await connection.write(command)
      await connection.close()
    }

    const activate = async (inputChannel: number, videoOutputChannel: number, audioOutputChannel: number) => {
      log.log(`extronSisDriver.activate(${inputChannel}, ${videoOutputChannel}, ${audioOutputChannel})`)
      const videoCommand = `${inputChannel}*${videoOutputChannel}%`
      const audioCommand = `${inputChannel}*${audioOutputChannel}$`
      await sendCommand(`${videoCommand}\r\n${audioCommand}\r\n`)
    }

    const powerOn = async () => {
      log.log('extronSisDriver.powerOn')
      log.debug('extronSisDriver.powerOn is a no-op')
      await Promise.resolve()
    }

    const powerOff = async () => {
      log.log('extronSisDriver.powerOff')
      log.debug('extronSisDriver.powerOff is a no-op')
      await Promise.resolve()
    }

    return await Promise.resolve({
      activate,
      powerOn,
      powerOff
    })
  }
})

export default extronSisDriver
