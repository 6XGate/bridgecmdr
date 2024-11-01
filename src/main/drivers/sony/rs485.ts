import Logger from 'electron-log'
import { defineDriver, kDeviceHasNoExtraCapabilities } from '../../services/drivers'
import { createCommandStream } from '../../services/stream'
import {
  createAddress,
  createCommand,
  kAddressAll,
  kPowerOff,
  kPowerOn,
  kSetChannel
} from '../../services/support/sonyRs485'
import type { Command, CommandArg } from '../../services/support/sonyRs485'

const sonyRs485Driver = defineDriver({
  enabled: true,
  guid: '8626D6D3-C211-4D21-B5CC-F5E3B50D9FF0',
  localized: {
    en: {
      title: 'Sony RS-485 controllable monitor',
      company: 'Sony Corporation',
      provider: 'BridgeCmdr contributors'
    }
  },
  capabilities: kDeviceHasNoExtraCapabilities,
  setup: () => {
    async function sendCommand(uri: string, command: Command, arg0?: CommandArg, arg1?: CommandArg) {
      const source = createAddress(kAddressAll, 0)
      const destination = createAddress(kAddressAll, 0)
      const packet = createCommand(destination, source, command, arg0, arg1)

      const connection = await createCommandStream(uri, {
        baudRate: 38400,
        dataBits: 8,
        stopBits: 1,
        parity: 'odd',
        timeout: 5000,
        keepAlive: true
      })

      // TODO: Other situation handlers...
      connection.on('data', (data) => {
        Logger.debug(`sonyRs485Driver: return: ${String(data)}`)
      })
      connection.on('error', (error) => {
        Logger.error(`sonyRs485Driver: ${error.message}`)
      })

      await connection.write(packet)
      await connection.close()
    }

    async function activate(uri: string, input: number) {
      Logger.log(`sonyRs485Driver.activate(${input})`)
      await sendCommand(uri, kSetChannel, 1, input)
    }

    async function powerOn(uri: string) {
      Logger.log('sonyRs485Driver.powerOn')
      await sendCommand(uri, kPowerOn)
    }

    async function powerOff(uri: string) {
      Logger.log('sonyRs485Driver.powerOff')
      await sendCommand(uri, kPowerOff)
    }

    return {
      activate,
      powerOn,
      powerOff
    }
  }
})

export default sonyRs485Driver
