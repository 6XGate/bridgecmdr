/// <reference lib="DOM" />

import { webcrypto } from 'node:crypto'
import { memo } from 'radash'

/* eslint-disable n/no-unsupported-features/node-builtins -- Some modules required this. */

declare global {
  // eslint-disable-next-line no-var -- Required to augment global.
  var crypto: Crypto
}

/**
 * Add Node's webcrypto to the global this.
 *
 * Needed for any modules that required the Web Crypto API.
 */
const useCrypto = memo(() => {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- Ensuring it is Polyfilled.
  if (globalThis.crypto == null) {
    globalThis.crypto = webcrypto as never
  }
})

export default useCrypto
