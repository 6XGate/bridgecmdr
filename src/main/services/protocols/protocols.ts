import Logger from 'electron-log'
import { memo } from 'radash'
import { createCommandStream } from '../stream'

interface ProtocolOptions {
  baudRate?: number
  dataBits?: 5 | 6 | 7 | 8
  stopBits?: 1 | 1.5 | 2
  parity?: 'none' | 'odd' | 'even'
  timeout?: number
  // TODO: onError?
  // TODO: onData?
  // TODO: Other situation handlers...
}

export const useProtocol = memo(function useProtocol(name: string, options: ProtocolOptions = {}) {
  // Options and defaults.
  const { baudRate = 9600, dataBits = 8, stopBits = 1, parity = 'none', timeout = 5000 } = options

  async function sendCommand(uri: string, command: Buffer): Promise<void>
  async function sendCommand(uri: string, command: string, encoding?: BufferEncoding): Promise<void>
  async function sendCommand(uri: string, command: Buffer | string, encoding?: BufferEncoding) {
    const connection = await createCommandStream(uri, {
      baudRate,
      dataBits,
      stopBits,
      parity,
      timeout,
      keepAlive: true
    })

    connection.on('data', (data) => {
      Logger.debug(`${name}; returned ${String(data)}`)
    })
    connection.on('error', (error) => {
      Logger.error(`${name}; ${error.message}`)
    })

    if (typeof command === 'string') {
      command = Buffer.from(command, encoding ?? 'ascii')
    }

    await connection.write(command)
    await connection.close()
  }

  return { sendCommand }
})
