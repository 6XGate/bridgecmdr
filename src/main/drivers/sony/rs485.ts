import Logger from 'electron-log'
import {
  createAddress,
  createCommand,
  kAddressAllMonitors,
  kPowerOff,
  kPowerOn,
  kSetChannel
} from '../../helpers/sonyRs485.js'
import { createCommandStream } from '../../helpers/stream.js'
import { defineDriver, kDeviceHasNoExtraCapabilities } from '../../system/driver.js'
import type { Command, CommandArg } from '../../helpers/sonyRs485.js'

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

      const connection = await createCommandStream(uri, {
        baudRate: 9600,
        timeout: 5000,
        keepAlive: true
      })

      // TODO: Other situation handlers...
      connection.on('data', data => {
        Logger.debug(`sonyRs485Driver: return: ${String(data)}`)
      })
      connection.on('error', error => {
        Logger.error(`sonyRs485Driver: ${error.message}`)
      })

      await connection.write(packet)
      await connection.close()
    }

    const activate = async (inputChannel: number) => {
      Logger.log(`sonyRs485Driver.activate(${inputChannel})`)
      await sendCommand(kSetChannel, 1, inputChannel)
    }

    const powerOn = async () => {
      Logger.log('sonyRs485Driver.powerOn')
      await sendCommand(kPowerOn)
    }

    const powerOff = async () => {
      Logger.log('sonyRs485Driver.Power On')
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