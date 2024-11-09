import Logger from 'electron-log'
import { memo } from 'radash'
import { useProtocol } from './protocols'

export const useShinybowV2Protocol = memo(function useShinybowV2Protocol() {
  const kProtocol = 'shinybow/v2.0'
  const { sendCommand } = useProtocol(kProtocol)

  const toChannel = (n: number) => String(n).padStart(2, '0')

  async function activate(uri: string, input: number, output: number) {
    Logger.log(`${kProtocol}/tie(${input}, ${output})`)
    await sendCommand(uri, `OUTPUT${toChannel(output)} ${toChannel(input)};\r\n`)
  }

  async function powerOn(uri: string) {
    Logger.log(`${kProtocol}/powerOn`)
    await sendCommand(uri, 'POWER 01;\r\n')
  }

  async function powerOff(uri: string) {
    Logger.log(`${kProtocol}/powerOff`)
    await sendCommand(uri, 'POWER 00;\r\n')
  }

  return {
    activate,
    powerOn,
    powerOff
  }
})

export const useShinybowV3Protocol = memo(function useShinybowV3Protocol() {
  const kProtocol = 'shinybow/v3.0'
  const { sendCommand } = useProtocol(kProtocol)

  const toChannel = (n: number) => String(n).padStart(3, '0')

  async function activate(uri: string, input: number, output: number) {
    Logger.log(`${kProtocol}/tie(${input}, ${output})`)
    await sendCommand(uri, `OUTPUT${toChannel(output)} ${toChannel(input)};\r\n`)
  }

  async function powerOn(uri: string) {
    Logger.log(`${kProtocol}/powerOn`)
    await sendCommand(uri, 'POWER 001;\r\n')
  }

  async function powerOff(uri: string) {
    Logger.log(`${kProtocol}/powerOff`)
    await sendCommand(uri, 'POWER 000;\r\n')
  }

  return {
    activate,
    powerOn,
    powerOff
  }
})
