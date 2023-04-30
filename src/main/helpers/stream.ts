import { createConnection } from 'node:net'
import { pipeline, finished } from 'node:stream/promises'
import { MockBinding } from '@serialport/binding-mock'
import { SerialPortStream } from '@serialport/stream'
import { SerialPort, SerialPortMock } from 'serialport'
import { z } from 'zod'
import type { LinuxOpenOptions, WindowsOpenOptions, DarwinOpenOptions } from '@serialport/bindings-cpp'
import type { Socket, NetConnectOpts, IpcNetConnectOpts, TcpNetConnectOpts } from 'node:net'
import type { Duplex, Writable } from 'node:stream'
import type { Simplify } from 'type-fest'

interface once {
  (event: 'data', listener: (chunk: unknown) => void): void
  (event: 'error', listener: (error: Error) => void): void
  (event: string | symbol, listener: (...args: unknown[]) => void): void
}

interface on {
  (event: 'data', listener: (chunk: unknown) => void): () => void
  (event: 'error', listener: (error: Error) => void): () => void
  (event: string | symbol, listener: (...args: unknown[]) => void): () => void
}

const useStream = <Stream extends Duplex> (stream: Writable) => {
  const write = async (data: Buffer | string) => {
    if (typeof data === 'string') {
      data = Buffer.from(data, 'ascii')
    }

    await pipeline(function * () { yield data }, stream)
  }

  const once = ((...[event, listener]: Parameters<Stream['once']>) => {
    stream.once(event, listener)
  }) as once

  const on = ((...[event, listener]: Parameters<Stream['on']>) => {
    const off = () => { stream.off(event, listener) }
    stream.on(event, listener)

    return off
  }) as on

  return {
    // setEncoding,
    write,
    once,
    on
  }
}

const createSocketStream = async (options: NetConnectOpts) => {
  const socket = await new Promise<Socket>((resolve, reject) => {
    try {
      const stream = createConnection(options, () => { resolve(stream) })
    } catch (e) {
      reject(e)
    }
  })

  const base = useStream(socket)

  const close = async () => {
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

export type SocketStreamOptions = Omit<IpcNetConnectOpts, 'path'>

const useSocketStream = async (path: string, options: SocketStreamOptions) =>
  await createSocketStream({ path, ...options })

export type NetStreamOptions = Omit<TcpNetConnectOpts, 'host' | 'port'>

const kHostWithOptionalPort = /^((?:\[[A-Fa-f0-9.:]+\])|(?:[\p{N}\p{L}.-]+))(?::([1-9][0-9]*))?$/u

const useNetStream = async (target: string, options: NetStreamOptions) => {
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

export type PortStreamOptions =
  & Omit<Simplify<LinuxOpenOptions & WindowsOpenOptions & DarwinOpenOptions>, 'path'>
  & { mock?: true }

const usePortStream = async (path: string, options: PortStreamOptions) => {
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

  const base = useStream(port)

  const close = async () => {
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

type CommandStreamOptions =
  & SocketStreamOptions
  & NetStreamOptions
  & PortStreamOptions

type SocketStream = Awaited<ReturnType<typeof useSocketStream>>
type NetSteam = Awaited<ReturnType<typeof useNetStream>>
type PortStream = Awaited<ReturnType<typeof usePortStream>>

type CommandStream = NetSteam & PortStream & SocketStream

// export async function useCommandStream (path: `port:${string}`, options: PortStreamOptions): Promise<PortStream>
// export async function useCommandStream (path: `ip:${string}`, options: NetStreamOptions): Promise<NetSteam>
// export async function useCommandStream (path: string, options: SocketStreamOptions): Promise<SocketStream>
export async function useCommandStream (path: string, options: CommandStreamOptions): Promise<CommandStream> {
  if (path.startsWith('port:')) {
    return await usePortStream(path.substring(5), options as PortStreamOptions)
  }

  if (path.startsWith('ip:')) {
    return await useNetStream(path.substring(3), options as NetStreamOptions)
  }

  return await useSocketStream(path, options as SocketStreamOptions)
}
