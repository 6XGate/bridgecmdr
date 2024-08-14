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
  env: { value: globalThis.api.env },
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
