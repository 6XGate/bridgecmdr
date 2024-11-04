import Logger from 'electron-log'
import { memo } from 'radash'
import { useProtocol } from './protocols'

export const useTeslaElecKvmProtocol = memo(function useTeslaElecKvmProtocol() {
  const kProtocol = 'teslaElec/kvm'
  const { sendCommand } = useProtocol(kProtocol)

  async function activate(uri: string, input: number) {
    Logger.log(`${kProtocol} << channel(${input})`)
    await sendCommand(uri, Buffer.of(0xaa, 0xbb, 0x03, 0x01, input, 0xee))
  }

  async function powerOn() {
    Logger.log(`${kProtocol}/powerOn; no-op`)
    await Promise.resolve()
  }

  async function powerOff() {
    Logger.log(`${kProtocol}/powerOff; no-op`)
    await Promise.resolve()
  }

  return {
    activate,
    powerOn,
    powerOff
  }
})

export const useTeslaElecMatrixProtocol = memo(function useTeslaElecMatrixProtocol() {
  const kProtocol = 'teslaElec/matrix'
  const { sendCommand } = useProtocol(kProtocol)

  const toChannel = (n: number) => String(n).padStart(2, '0')

  async function activate(uri: string, input: number, output: number) {
    Logger.log(`${kProtocol} << tie(${input}, ${output})`)
    await sendCommand(uri, `MT00SW${toChannel(input)}${toChannel(output)}NT\r\n`)

    await Promise.resolve()
  }

  async function powerOn() {
    Logger.log(`${kProtocol}/powerOn; no-op`)
    await Promise.resolve()
  }

  async function powerOff() {
    Logger.log(`${kProtocol}/powerOff; no-op`)
    await Promise.resolve()
  }

  return {
    activate,
    powerOn,
    powerOff
  }
})

export const useTeslaElecSdiProtocol = memo(function useTeslaElecSdiProtocol() {
  const kProtocol = 'teslaElec/sdi'
  const { sendCommand } = useProtocol(kProtocol)

  async function activate(uri: string, input: number) {
    Logger.log(`${kProtocol} << channel(${input})`)
    await sendCommand(uri, Buffer.of(0xaa, 0xcc, 0x01, input))
  }

  async function powerOn() {
    Logger.log(`${kProtocol}/powerOn; no-op`)
    await Promise.resolve()
  }

  async function powerOff() {
    Logger.log(`${kProtocol}/powerOff; no-op`)
    await Promise.resolve()
  }

  return {
    activate,
    powerOn,
    powerOff
  }
})
