import type { IpcMain, IpcRenderer, WebContents } from 'electron'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function notImplemented<Fn extends (...args: any[]) => any>() {
  return (..._: Parameters<Fn>): ReturnType<Fn> => {
    throw new Error('Not implemented')
  }
}

export class IpcReactor {
  invokeOnMain = notImplemented<(channel: string, ...args: unknown[]) => Promise<unknown>>()
  emitToMain = notImplemented<(channel: string, ...args: unknown[]) => unknown>()

  invokeOnRenderer = notImplemented<(channel: string, ...args: unknown[]) => Promise<unknown>>()
  emitToRenderer = notImplemented<(channel: string, ...args: unknown[]) => void>()

  getIpcMain = notImplemented<() => IpcMain>()
  getIpcRenderer = notImplemented<() => IpcRenderer>()
  getWebContents = notImplemented<() => WebContents>()
}
