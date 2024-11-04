import Logger from 'electron-log'
import { memo } from 'radash'
import { useProtocol } from './protocols'
import { createAddress, createCommand, kAddressAll, kPowerOff, kPowerOn, kSetChannel } from './sonyRs485'
import type { Command, CommandArg } from './sonyRs485'

export const useSonyBvmProtocol = memo(function useSonyBvmProtocol() {
  const kProtocol = 'sony/bvm'

  const { sendCommand: sendRawCommand } = useProtocol(kProtocol, {
    baudRate: 38400,
    dataBits: 8,
    stopBits: 1,
    parity: 'odd',
    timeout: 5000
  })

  async function sendCommand(uri: string, command: Command, arg0?: CommandArg, arg1?: CommandArg) {
    const source = createAddress(kAddressAll, 0)
    const destination = createAddress(kAddressAll, 0)
    const packet = createCommand(destination, source, command, arg0, arg1)

    await sendRawCommand(uri, packet)
  }

  async function activate(uri: string, input: number) {
    Logger.log(`${kProtocol}/channel(${input})`)
    await sendCommand(uri, kSetChannel, 1, input)
  }

  async function powerOn(uri: string) {
    Logger.log(`${kProtocol}/powerOn`)
    await sendCommand(uri, kPowerOn)
  }

  async function powerOff(uri: string) {
    Logger.log(`${kProtocol}/powerOff`)
    await sendCommand(uri, kPowerOff)
  }

  return {
    activate,
    powerOn,
    powerOff
  }
})
