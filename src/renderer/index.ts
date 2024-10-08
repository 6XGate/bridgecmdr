import { Buffer } from 'buffer'
import log from 'electron-log'
import 'setimmediate'

//
// Earliest to enable logger.
//

if (import.meta.env.PROD) {
  log.errorHandler.startCatching()
}

//
// Polyfills
//
// These polyfills will allow some dependencies we use to function as
// if under node due to needing certain things in the globalThis.
//

globalThis.global = globalThis
globalThis.Buffer = Buffer
Object.defineProperties((globalThis.process = {} as never), {
  arch: { value: globalThis.services.process.arch },
  argv: { value: globalThis.services.process.argv },
  argv0: { value: globalThis.services.process.argv0 },
  env: { value: globalThis.services.process.env },
  execPath: { value: globalThis.services.process.execPath },
  mas: { value: globalThis.services.process.appleStore },
  platform: { value: globalThis.services.process.platform },
  resourcesPath: { value: globalThis.services.process.resourcesPath },
  sandboxed: { value: globalThis.services.process.sandboxed },
  type: { value: globalThis.services.process.type },
  version: { value: globalThis.services.process.version },
  versions: { value: globalThis.services.process.versions },
  windowsStore: { value: globalThis.services.process.windowsStore },
  nextTick: { value: setImmediate }
})

//
// Dynamic load the main module.
//

async function main() {
  await import('./main')
}

main().catch((e: unknown) => {
  console.error('Fatal application boot failure', e)
})
