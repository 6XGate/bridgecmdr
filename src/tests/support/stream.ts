import { EventEmitter } from 'node:events'
import { expect, vi } from 'vitest'
import type { CommandStream } from '../../main/services/stream'
import { raiseError } from '@/error-handling'

/* eslint-disable @typescript-eslint/consistent-type-imports -- Required for module mocks. */

interface StreamListeners {
  data: [chunk: unknown]
  error: [error: Error]
}

interface StreamEvents {
  write: [data: Buffer | string]
  close: []
}

type CommandDefinition = [data: Buffer, response: () => Buffer]

class CommandSequence {
  definition = new Array<CommandDefinition>()
  position = 0
  mock

  constructor(mock: MockCommandStream) {
    this.mock = mock
  }

  expectDone() {
    expect(this.position).toEqual(this.definition.length)
  }

  on(...definition: CommandDefinition) {
    this.definition.push(definition)
    return this
  }

  track(data: Buffer): Buffer | null {
    const command = this.definition[this.position]
    expect(command).not.toBeNull()
    if (command == null) {
      throw new SyntaxError(`Unexpected command after end of sequence ${String(data)}`)
    }

    this.position += 1
    const [cmd, sender] = command
    expect(data).toEqual(cmd)

    return sender()
  }
}

export class MockCommandStream implements CommandStream {
  /** Allows emitting to listeners. */
  readonly listeners = new EventEmitter<StreamListeners>()
  /** Allows listening to calls. */
  readonly events = new EventEmitter<StreamEvents>()
  /** Stores received data. */
  received = new Array<Buffer>()
  /** Indicates the stream was closed. */
  closed = false
  /** Allows following a known sequnce of commands. */
  #sequence = null as null | CommandSequence

  get sequence() {
    return this.#sequence ?? raiseError(() => new SyntaxError('Sequence not started'))
  }

  withSequence() {
    if (this.#sequence != null) return this.#sequence
    this.#sequence = new CommandSequence(this)
    return this.#sequence
  }

  async write(data: Buffer | string) {
    if (typeof data === 'string') {
      data = Buffer.from(data, 'ascii')
    }

    this.events.emit('write', data)
    this.received.push(data)
    if (this.#sequence == null) {
      return
    }

    const response = this.#sequence.track(data)
    if (response != null) {
      this.listeners.emit('data', response)
    }

    await Promise.resolve()
  }

  once(event: 'data', listener: (chunk: unknown) => void): void
  once(event: 'error', listener: (error: Error) => void): void
  once(event: string | symbol, listener: (...args: any[]) => void) {
    this.listeners.once(event, listener as never)
  }

  on(event: 'data', listener: (chunk: unknown) => void): () => void
  on(event: 'error', listener: (error: Error) => void): () => void
  on(event: string | symbol, listener: (...args: any[]) => void) {
    const off = () => {
      this.listeners.off(event, listener as never)
    }

    this.listeners.on(event, listener as never)
    return off
  }

  async close() {
    this.events.emit('close')
    this.closed = true
    await Promise.resolve()
  }
}

export interface MockStreamContext {
  stream: MockCommandStream
}

export function commandStreamModule(context: MockStreamContext) {
  return async (original: () => Promise<typeof import('../../main/services/stream')>) => {
    const module = await original()

    const createCommandStream = vi
      .fn(module.createCommandStream)
      .mockImplementation(async () => await Promise.resolve(context.stream))

    return {
      ...module,
      createCommandStream
    }
  }
}
