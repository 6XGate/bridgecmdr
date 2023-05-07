import { createConnection } from 'node:net'
import { pipeline, finished } from 'node:stream/promises'
import { MockBinding } from '@serialport/binding-mock'
import { SerialPortStream } from '@serialport/stream'
import { memo } from 'radash'
import { SerialPort, SerialPortMock } from 'serialport'
import { z } from 'zod'
import type { LinuxOpenOptions, WindowsOpenOptions, DarwinOpenOptions } from '@serialport/bindings-cpp'
import type { Socket, NetConnectOpts, IpcNetConnectOpts, TcpNetConnectOpts } from 'node:net'
import type { Duplex } from 'node:stream'
import type { Simplify } from 'type-fest'

export type IpcStreamOptions = Omit<IpcNetConnectOpts, 'path'>

export type NetStreamOptions = Omit<TcpNetConnectOpts, 'host' | 'port'>

export type PortStreamOptions =
  & Omit<Simplify<LinuxOpenOptions & WindowsOpenOptions & DarwinOpenOptions>, 'path'>
  & { mock?: true }

const useStreams = memo(() => {
  function createStream<Stream extends Duplex> (stream: Stream) {
    async function write (data: Buffer | string) {
      if (typeof data === 'string') {
        data = Buffer.from(data, 'ascii')
      }

      await pipeline(function * () { yield data }, stream)
    }

    function once (event: 'data', listener: (chunk: unknown) => void): void
    function once (event: 'error', listener: (error: Error) => void): void
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Will not match anything but unknown.
    function once (event: string | symbol, listener: (...args: any[]) => void) {
      stream.once(event, listener)
    }

    function on (event: 'data', listener: (chunk: unknown) => void): () => void
    function on (event: 'error', listener: (error: Error) => void): () => void
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Will not match anything but unknown.
    function on (event: string | symbol, listener: (...args: any[]) => void) {
      const off = () => { stream.off(event, listener) }
      stream.on(event, listener)

      return off
    }

    return {
      // setEncoding,
      write,
      once,
      on
    }
  }

  async function createSocketStream (options: NetConnectOpts) {
    const socket = await new Promise<Socket>((resolve, reject) => {
      try {
        const stream = createConnection(options, () => { resolve(stream) })
      } catch (e) {
        reject(e)
      }
    })

    const base = createStream(socket)

    async function close () {
      await new Promise<void>((resolve, reject) => {
        socket.once('error', e => { reject(e) })
        socket.end(() => { resolve() })
      })

      await finished(socket)

      socket.destroy()
    }

    return {
      ...base,
      close
    }
  }

  async function createIpcStream (path: string, options: IpcStreamOptions) {
    return await createSocketStream({ path, ...options })
  }

  const kHostWithOptionalPort = /^((?:\[[A-Fa-f0-9.:]+\])|(?:[\p{N}\p{L}.-]+))(?::([1-9][0-9]*))?$/u

  async function createNetStream (target: string, options: NetStreamOptions) {
    const parts = kHostWithOptionalPort.exec(target)
    if (parts == null || parts[1] == null) {
      throw new Error(`target "${target}" is not a valid host or host:port combination`)
    }

    // Right now, we will trust the front-end to confirm
    // this or Socket should throw an error.
    const host = parts[1]
    const port = z.coerce.number().int().positive().default(23).parse(parts[2])

    return await createSocketStream({ host, port, ...options })
  }

  async function createPortStream (path: string, options: PortStreamOptions) {
    const port = options.mock
      ? (await new Promise<SerialPortStream>((resolve, reject) => {
          SerialPortMock.binding.createPort(path, { echo: true })
          const stream = new SerialPortStream(
            { binding: MockBinding, path, ...options },
            e => {
              e != null
                ? reject(e)
                : resolve(stream)
            }
          )

          stream.on('open', () => { stream.port?.emitData('ok') })
        }))
      : (await new Promise<SerialPortStream>((resolve, reject) => {
          const stream = new SerialPort(
            { path, ...options },
            e => {
              e != null
                ? reject(e)
                : resolve(stream)
            })
        }))

    const base = createStream(port)

    async function close () {
      await new Promise<void>((resolve, reject) => {
        port.close(e => { e != null ? reject(e) : resolve() })
      })

      await finished(port)

      port.destroy()
    }

    return {
      ...base,
      close
    }
  }

  type CommandStreamOptions = IpcStreamOptions & NetStreamOptions & PortStreamOptions

  type SocketStream = Awaited<ReturnType<typeof createIpcStream>>
  type NetSteam = Awaited<ReturnType<typeof createNetStream>>
  type PortStream = Awaited<ReturnType<typeof createPortStream>>

  type CommandStream = NetSteam & PortStream & SocketStream

  // export async function useCommandStream (path: `port:${string}`, options: PortStreamOptions): Promise<PortStream>
  // export async function useCommandStream (path: `ip:${string}`, options: NetStreamOptions): Promise<NetSteam>
  // export async function useCommandStream (path: string, options: SocketStreamOptions): Promise<SocketStream>
  async function createCommandStream (path: string, options: CommandStreamOptions): Promise<CommandStream> {
    if (path.startsWith('port:')) {
      return await createPortStream(path.substring(5), options as PortStreamOptions)
    }

    if (path.startsWith('ip:')) {
      return await createNetStream(path.substring(3), options as NetStreamOptions)
    }

    return await createIpcStream(path, options as IpcStreamOptions)
  }

  return createCommandStream
})

export default useStreams
