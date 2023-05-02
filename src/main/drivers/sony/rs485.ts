import log from 'electron-log'
import {
  createAddress,
  createCommand,
  kAddressAllMonitors,
  kPowerOff,
  kPowerOn,
  kSetChannel
} from '@main/helpers/sonyRs485'
import { useCommandStream } from '@main/helpers/stream'
import { defineDriver, kDeviceHasNoExtraCapabilities } from '@main/system/driver'
import type { Command, CommandArg } from '@main/helpers/sonyRs485'

const sonyRs485Driver = defineDriver({
  enable: true,
  guid: '8626D6D3-C211-4D21-B5CC-F5E3B50D9FF0',
  localized: {
    en: {
      title: 'Sony RS-485 controllable monitor',
      company: 'Sony Corporation',
      provider: 'BridgeCmdr contributors'
    }
  },
  capabilities: kDeviceHasNoExtraCapabilities,
  setup: async uri => {
    const sendCommand = async (command: Command, arg0?: CommandArg, arg1?: CommandArg) => {
      const source = createAddress(kAddressAllMonitors, 0)
      const destination = createAddress(kAddressAllMonitors, 0)
      const packet = createCommand(destination, source, command, arg0, arg1)

      const connection = await useCommandStream(uri, {
        baudRate: 9600,
        timeout: 5000,
        keepAlive: true
      })

      // TODO: Other situation handlers...
      connection.on('data', data => { log.debug(`sonyRs485Driver: return: ${String(data)}`) })
      connection.on('error', error => { log.error(`sonyRs485Driver: ${error.message}`) })

      await connection.write(packet)
      await connection.close()
    }

    const activate = async (inputChannel: number) => {
      log.log(`sonyRs485Driver.activate(${inputChannel})`)
      await sendCommand(kSetChannel, 1, inputChannel)
    }

    const powerOn = async () => {
      log.log('sonyRs485Driver.powerOn')
      await sendCommand(kPowerOn)
    }

    const powerOff = async () => {
      log.log('sonyRs485Driver.Power On')
      await sendCommand(kPowerOff)
    }

    return await Promise.resolve({
      activate,
      powerOn,
      powerOff
    })
  }
})

export default sonyRs485Driver
