import Logger from 'electron-log'
import { defineDriver, kDeviceHasNoExtraCapabilities } from '../../services/driver'
import { createAddress, createCommand, kAddressAll, kPowerOff, kPowerOn, kSetChannel } from '../../services/sonyRs485'
import { createCommandStream } from '../../services/stream'
import type { Command, CommandArg } from '../../services/sonyRs485'

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
  setup: async function setup(uri) {
    async function sendCommand(command: Command, arg0?: CommandArg, arg1?: CommandArg) {
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

    async function activate(inputChannel: number) {
      Logger.log(`sonyRs485Driver.activate(${inputChannel})`)
      await sendCommand(kSetChannel, 1, inputChannel)
    }

    async function powerOn() {
      Logger.log('sonyRs485Driver.powerOn')
      await sendCommand(kPowerOn)
    }

    async function powerOff() {
      Logger.log('sonyRs485Driver.powerOff')
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
