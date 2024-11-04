import Logger from 'electron-log'
import { memo } from 'radash'
import { useProtocol } from './protocols'

export const useExtronSisProtocol = memo(function useExtronSisProtocol() {
  const kProtocol = 'extron/sis'

  const { sendCommand } = useProtocol(kProtocol)

  async function activate(uri: string, input: number, videoOutput: number, audioOutput: number) {
    Logger.log(`${kProtocol}/tie(${input}, ${videoOutput}, ${audioOutput})`)
    const videoCommand = `${input}*${videoOutput}%`
    const audioCommand = `${input}*${audioOutput}$`
    await sendCommand(uri, `${videoCommand}\r\n${audioCommand}\r\n`)
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
