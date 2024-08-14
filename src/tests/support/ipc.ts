import NodeEventEmitter from 'node:events'
import { notImplemented } from './reactor'
import type { IpcReactor } from './reactor'
import type { MaybePromise } from '@/basics'
import type { IpcMain, IpcMainEvent, IpcMainInvokeEvent, IpcRenderer, IpcRendererEvent } from 'electron'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type EventMap<T> = Record<keyof T, any[]> | DefaultEventMap

type DefaultEventMap = [never]

// // eslint-disable-next-line @typescript-eslint/no-explicit-any
// type AnyRest = [...args: any[]]

// type Key<K, T> = T extends DefaultEventMap ? string | symbol : K | keyof T
// type Args<K, T> = T extends DefaultEventMap ? AnyRest : K extends keyof T ? T[K] : never

class EventEmitter<T extends EventMap<T> = DefaultEventMap> extends NodeEventEmitter<T> {
  // readonly #watchers = new Set<<K>(eventName: Key<K, T>, ...args: Args<K, T>) => void>()
  //
  // watch(watcher: <K>(eventName: Key<K, T>, ...args: Args<K, T>) => void) {
  //   this.#watchers.add(watcher)
  // }
  //
  // unwatch(watcher: <K>(eventName: Key<K, T>, ...args: Args<K, T>) => void) {
  //   this.#watchers.delete(watcher)
  // }
  //
  // override emit<K>(eventName: Key<K, T>, ...args: Args<K, T>) {
  //   this.#watchers.forEach(watcher => {
  //     watcher(eventName, ...args)
  //   })
  //
  //   return super.emit(eventName, ...args)
  // }
}

type IpcInvokeHandler = (event: IpcMainInvokeEvent, ...args: any[]) => MaybePromise<unknown>
type IpcMainHandler = (event: IpcMainEvent, ...args: any[]) => void
type IpcMainEventMap = Record<string, Parameters<IpcMainHandler>>

type IpcRendererHandler = (event: IpcRendererEvent, ...args: any[]) => void
type IpcRendererEventMap = Record<string, Parameters<IpcRendererHandler>>

class IpcMainIpcMainEventEmitter extends EventEmitter<IpcMainEventMap> {}
class IpcRendererEventEmiiter extends EventEmitter<IpcRendererEventMap> {}

export class MockIpcMain extends IpcMainIpcMainEventEmitter implements IpcMain {
  readonly reactor

  readonly channels = new Map<string, IpcInvokeHandler>()

  constructor(reactor: IpcReactor) {
    super()
    this.reactor = reactor

    reactor.getIpcMain = () => this

    reactor.invokeOnMain = async (channel, ...args) => {
      const listener = this.channels.get(channel)
      // TODO: Need to determine how this should respond.
      if (listener == null) return {}

      const event = {
        sender: reactor.getWebContents(),
        frameId: 1,
        processId: 1,
        senderFrame: {} as Electron.WebFrameMain,
        defaultPrevented: false,
        preventDefault: notImplemented()
        // preventDefault: () => {
        //   event.defaultPrevented = true
        // }
      } // satisfies IpcMainInvokeEvent, causes defaultPrevented

      return await Promise.resolve(listener(event, ...args))
    }

    reactor.emitToMain = (channel, ...args) => {
      const event = {
        ports: [],
        sender: reactor.getWebContents(),
        frameId: 1,
        processId: 1,
        senderFrame: {} as Electron.WebFrameMain,
        defaultPrevented: false,
        returnValue: undefined as unknown,
        reply: notImplemented,
        preventDefault: notImplemented()
        // preventDefault: () => {
        //   event.defaultPrevented = true
        // }
      } // satisfies IpcMainEvent, causes defaultPrevented

      this.emit(channel, event, ...args)
      return event.returnValue
    }
  }

  handle(channel: string, listener: IpcInvokeHandler): void {
    this.channels.set(channel, listener)
  }

  handleOnce = notImplemented()
  // handleOnce(channel: string, listener: IpcInvokeHandler): void {
  //   const wrapper: IpcInvokeHandler = (...args: Parameters<IpcInvokeHandler>) => {
  //     this.channels.delete(channel)
  //     return listener(...args)
  //   }
  //
  //   this.channels.set(channel, wrapper)
  // }

  removeHandler = notImplemented()
  // removeHandler(channel: string): void {
  //   this.channels.delete(channel)
  // }
}

export class MockIpcRenderer extends IpcRendererEventEmiiter implements IpcRenderer {
  readonly reactor: IpcReactor

  constructor(reactor: IpcReactor) {
    super()
    this.reactor = reactor

    reactor.getIpcRenderer = () => this

    // reactor.invokeOnRenderer = async (channel, ...args) => {}

    reactor.emitToRenderer = (channel, ...args) => {
      const event = {
        defaultPrevented: false,
        ports: [],
        sender: this,
        preventDefault: notImplemented()
        // preventDefault: () => {
        //   event.defaultPrevented = true
        // }
      } // satisfies IpcRendererEvent, causes readonly defaultPrevented

      this.emit(channel, event, ...args)
    }
  }

  async invoke(channel: string, ...args: unknown[]): Promise<unknown> {
    return await this.reactor.invokeOnMain(channel, ...args)
  }

  send(channel: string, ...args: unknown[]): void {
    this.reactor.emitToMain(channel, ...args)
  }

  sendSync = notImplemented()
  // sendSync(channel: string, ...args: unknown[]) {
  //   return this.reactor.emitToMain(channel, ...args)
  // }

  postMessage = notImplemented()
  sendToHost = notImplemented()
}
