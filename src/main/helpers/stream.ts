import { createConnection } from 'node:net'
import { pipeline, finished } from 'node:stream/promises'
import { SerialPort } from 'serialport'
import { z } from 'zod'
import type { Socket, NetConnectOpts, IpcNetConnectOpts, TcpNetConnectOpts } from 'node:net'
import type { Duplex } from 'node:stream'
import type { Simplify } from 'type-fest'
import { toError } from '@/error-handling'

export type IpcStreamOptions = Omit<IpcNetConnectOpts, 'path'>

export type NetStreamOptions = Omit<TcpNetConnectOpts, 'host' | 'port'>

type CommonPortStreamOptions = ConstructorParameters<typeof SerialPort>[0]

export type PortStreamOptions = Omit<Simplify<CommonPortStreamOptions>, 'path'>

interface StreamImplementation {
  close: () => Promise<void>
}

function createStream(stream: Duplex, implementation: StreamImplementation) {
  async function write(data: Buffer | string) {
    if (typeof data === 'string') {
      data = Buffer.from(data, 'ascii')
    }

    await pipeline(function* () {
      yield data
    }, stream)
  }

  function once(event: 'data', listener: (chunk: unknown) => void): void
  function once(event: 'error', listener: (error: Error) => void): void

  function once(event: string | symbol, listener: (...args: any[]) => void) {
    stream.once(event, listener)
  }

  function on(event: 'data', listener: (chunk: unknown) => void): () => void
  function on(event: 'error', listener: (error: Error) => void): () => void

  function on(event: string | symbol, listener: (...args: any[]) => void) {
    const off = () => {
      stream.off(event, listener)
    }
    stream.on(event, listener)

    return off
  }

  return {
    ...implementation,
    write,
    once,
    on
  }
}

async function createSocketStream(options: NetConnectOpts) {
  const socket = await new Promise<Socket>(function createSocketStreamInner(resolve, reject) {
    try {
      const stream = createConnection(options, () => {
        resolve(stream)
      })
    } catch (e) {
      reject(toError(e))
    }
  })

  async function close() {
    await new Promise<void>((resolve, reject) => {
      socket.once('error', (e) => {
        reject(e)
      })
      socket.end(() => {
        resolve()
      })
    })

    await finished(socket)

    socket.destroy()
  }

  return createStream(socket, { close })
}

async function createIpcStream(path: string, options: IpcStreamOptions) {
  return await createSocketStream({ path, ...options })
}

const kHostWithOptionalPort = /^((?:\[[A-Fa-f0-9.:]+\])|(?:[\p{N}\p{L}.-]+))(?::([1-9][0-9]*))?$/u

async function createNetStream(target: string, options: NetStreamOptions) {
  const parts = kHostWithOptionalPort.exec(target)
  if (parts?.[1] == null) {
    throw new Error(`target "${target}" is not a valid host or host:port combination`)
  }

  // Right now, we will trust the front-end to confirm
  // this or Socket should throw an error.
  const host = parts[1]
  const port = z.coerce.number().int().positive().default(23).parse(parts[2])

  return await createSocketStream({ host, port, ...options })
}

async function createPortStream(path: string, options: PortStreamOptions) {
  const port = await new Promise<SerialPort>(function createPortStreamInner(resolve, reject) {
    const stream = new SerialPort({ path, ...options }, (e) => {
      if (e != null) reject(e)
      else resolve(stream)
    })
  })

  async function close() {
    await new Promise<void>((resolve, reject) => {
      port.close((e) => {
        if (e != null) reject(e)
        else resolve()
      })
    })

    await finished(port)

    port.destroy()
  }

  return createStream(port, { close })
}

export type CommandStreamOptions = IpcStreamOptions | NetStreamOptions | PortStreamOptions

export type CommandStream = ReturnType<typeof createStream>

export async function createCommandStream(path: string, options: CommandStreamOptions): Promise<CommandStream> {
  if (path.startsWith('port:')) {
    return await createPortStream(path.substring(5), options as PortStreamOptions)
  }

  if (path.startsWith('ip:')) {
    return await createNetStream(path.substring(3), options as NetStreamOptions)
  }

  return await createIpcStream(path, options as IpcStreamOptions)
}
