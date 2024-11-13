import { vi } from 'vitest'
import type { MainLogger } from 'electron-log'

export function electronModule() {
  return {
    app: {
      getName: () => 'BridgeCmdr==mock==',
      getVersion: () => '2.0.0==mock==',
      getLocale: () => 'en==mock==',
      getPath: (...args: Parameters<Electron.App['getPath']>) => {
        const [name] = args
        switch (name) {
          case 'exe':
            return '/usr/bin/BridgeCmdr'
          case 'userData':
            return 'logs'
          default:
            return 'logs'
        }
      },
      on(_name: string, ..._args: unknown[]) {
        return this
      }
    }
  }
}

export function elctronLogModule() {
  const initialize = vi.fn<MainLogger['initialize']>().mockReturnValue()

  const error = vi.fn<MainLogger['error']>().mockReturnValue()
  const warn = vi.fn<MainLogger['warn']>().mockReturnValue()
  const info = vi.fn<MainLogger['info']>().mockReturnValue()
  const log = vi.fn<MainLogger['log']>().mockReturnValue()
  const debug = vi.fn<MainLogger['debug']>().mockReturnValue()

  return {
    default: {
      initialize,
      error,
      warn,
      info,
      log,
      debug
    }
  }
}

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
