import { EventEmitter } from 'node:events'
import fs from 'node:fs/promises'
import { join } from 'node:path'
import { vi } from 'vitest'
import type { MainLogger } from 'electron-log'

export function electronModule(test = 'test') {
  return async function electronMockFactory() {
    interface AppEvents {
      'will-quit': []
    }

    const exePath = join('/usr', 'bin', 'BridgeCmdr')

    // Make sure the userData path exists.
    const userDataPath = join('logs', test)
    await fs.mkdir(userDataPath, { recursive: true })

    class App extends EventEmitter<AppEvents> {
      getName() {
        return 'BridgeCmdr==mock=='
      }

      getVersion() {
        return '2.0.0==mock=='
      }

      getLocale() {
        return 'en==mock=='
      }

      getPath(...args: Parameters<Electron.App['getPath']>) {
        const [name] = args
        switch (name) {
          case 'exe':
            return exePath
          case 'userData':
          default:
            return userDataPath
        }
      }
    }

    return {
      app: new App()
    }
  }
}

export function electronLogModule() {
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
