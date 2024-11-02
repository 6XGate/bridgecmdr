/* eslint-disable @typescript-eslint/consistent-type-imports -- Required for module mocking */

import { vi } from 'vitest'

const { MockWebContents } = await import('./contents')
const { MockContextBridge } = await import('./context')
const { MockIpcMain, MockIpcRenderer } = await import('./ipc')
const { IpcReactor } = await import('./reactor')

export function useMocks() {
  const reactor = new IpcReactor()
  const ipcMain = new MockIpcMain(reactor)
  const ipcRenderer = new MockIpcRenderer(reactor)
  const contextBridge = new MockContextBridge()
  const webContent = new MockWebContents(reactor)

  return {
    reactor,
    ipcMain,
    ipcRenderer,
    contextBridge,
    webContent
  }
}

export async function electronModule(original: () => Promise<typeof import('electron')>) {
  const electron = await original()
  const { ipcMain, ipcRenderer, contextBridge } = useMocks()

  return {
    ...electron,
    ipcMain,
    ipcRenderer,
    contextBridge,
    app: {
      getName: () => 'BridgeCmdr==mock==',
      getVersion: () => '2.0.0==mock==',
      getLocale: () => 'en==mock==',
      getPath: (_name: string) => 'logs',
      on(_name: string, _ev: unknown) {
        return this
      }
    } as Electron.App
  }
}

// FIXME: Not needed right now, but won't always mock well.
// export async function elctronLogModule(original: () => Promise<typeof import('electron-log')>) {
//   const Logger = await original()
//
//   const initialize = vi.spyOn(Logger, 'initialize').mockReturnValue()
//
//   const error = vi.spyOn(Logger, 'error').mockReturnValue()
//   const warn = vi.spyOn(Logger, 'warn').mockReturnValue()
//   const info = vi.spyOn(Logger, 'info').mockReturnValue()
//   const log = vi.spyOn(Logger, 'log').mockReturnValue()
//   const debug = vi.spyOn(Logger, 'debug').mockReturnValue()
//
//   return {
//     ...Logger,
//     initialize,
//     error,
//     warn,
//     info,
//     log,
//     debug
//   }
// }

export function console() {
  const error = vi.spyOn(globalThis.console, 'error').mockReturnValue()
  const warn = vi.spyOn(globalThis.console, 'warn').mockReturnValue()
  const info = vi.spyOn(globalThis.console, 'info').mockReturnValue()
  const log = vi.spyOn(globalThis.console, 'log').mockReturnValue()
  const debug = vi.spyOn(globalThis.console, 'debug').mockReturnValue()

  return {
    error,
    warn,
    info,
    log,
    debug
  }
}
