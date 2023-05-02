import { Buffer } from 'buffer'
import log from 'electron-log'

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
// if under nodedue to needing certain things in the globalThis.
//

globalThis.global = globalThis
globalThis.Buffer = Buffer

//
// Dynamic load the main module.
//

import('./main').catch(e => { console.error('Fatal application boot failure', e) })
