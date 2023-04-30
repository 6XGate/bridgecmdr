import { webcrypto } from 'node:crypto'

declare global {
  // eslint-disable-next-line no-var -- Required to augment global.
  var crypto: typeof webcrypto
}

/**
 * Add Node's webcrypto to the global this.
 *
 * Needed for any modules that required the Web Crypto API.
 */

const useWebCryptoPlugin = () => {
  globalThis.crypto = webcrypto
}

export default useWebCryptoPlugin
