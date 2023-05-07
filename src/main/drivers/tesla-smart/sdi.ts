import useCommandStream from '@main/helpers/stream'
import useLogging from '@main/plugins/log'
import { defineDriver, kDeviceHasNoExtraCapabilities } from '@main/system/driver'

const teslaSmartSdiDriver = defineDriver({
  enable: true,
  guid: '91D5BC95-A8E2-4F58-BCAC-A77BA1054D61',
  localized: {
    en: {
      title: 'Tesla smart SDI-compatible switch',
      company: 'Tesla Elec Technology Co.,Ltd',
      provider: 'BridgeCmdr contributors'
    }
  },
  capabilities: kDeviceHasNoExtraCapabilities,
  setup: async uri => {
    const log = useLogging()
    const createCommandStream = useCommandStream()

    const sendCommand = async (command: Buffer) => {
      const connection = await createCommandStream(uri, {
        baudRate: 9600,
        timeout: 5000,
        keepAlive: true
      })

      // TODO: Other situation handlers...
      connection.on('data', data => { log.debug(`teslaSmartSdiDriver: return: ${String(data)}`) })
      connection.on('error', error => { log.error(`teslaSmartSdiDriver: ${error.message}`) })

      await connection.write(command)
      await connection.close()
    }

    const activate = async (inputChannel: number) => {
      log.log(`teslaSmartSdiDriver.activate(${inputChannel})`)
      await sendCommand(Buffer.from(Uint8Array.from([0xAA, 0xBB, 0x03, 0x01, inputChannel, 0xEE])))
    }

    const powerOn = async () => {
      log.log('teslaSmartSdiDriver.powerOn')
      await Promise.resolve()
    }

    const powerOff = async () => {
      log.log('teslaSmartSdiDriver.powerOff')
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
