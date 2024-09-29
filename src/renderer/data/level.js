import { PassThrough, pipeline, Writable } from 'stream'
import { AbstractLevelDOWN } from 'abstract-leveldown'
import duplexify from 'duplexify'
import levelup from 'levelup'
// @ts-expect-error -- No types
import leveldown from 'multileveldown/leveldown'
// @ts-expect-error -- No types
import LevelPouch from 'pouchdb-adapter-leveldb-core'
import { memo } from 'radash'
import { toError } from '@/error-handling'

/** @typedef {import('node:stream').Duplex} Duplex */
/** @template ALD @template AI @typedef {import('levelup').LevelUp<ALD,AI>} LevelUp<ALD,AI> */
/** @typedef {import('abstract-leveldown').ErrorCallback} ErrorCallback */
/** @template K @typedef {import('abstract-leveldown').ErrorValueCallback<K>} ErrorValueCallback<K> */
/** @typedef {import('abstract-leveldown').AbstractOpenOptions} AbstractOpenOptions */
/** @typedef {import('abstract-leveldown').AbstractGetOptions} AbstractGetOptions */
/** @typedef {import('abstract-leveldown').AbstractOptions} AbstractOptions */
/** @template K @template V @typedef {import('abstract-leveldown').AbstractBatch<K,V>} AbstractBatch<K,V> */
/** @template K @typedef {import('abstract-leveldown').AbstractIteratorOptions<K>} AbstractIteratorOptions<K> */
/** @template K @template V @typedef {import('abstract-leveldown').AbstractIterator<K,V>} AbstractIterator<K,V> */
/** @typedef {import('../../preload/api').Handle} Handle */

/**
 * @param {string} name
 */
async function openDatabase(name) {
  const h = await globalThis.services.level.open(name)

  const readable = new PassThrough({
    destroy: () => {
      // eslint-disable-next-line @typescript-eslint/use-unknown-in-catch-callback-variable
      globalThis.services.freeHandle(h).catch(console.error)
    }
  })

  const sender = await globalThis.services.level.activate(h, (message) => {
    readable.write(message)
  })

  const writable = new Writable({
    write: (chunk, _, next) => {
      sender(chunk)
      next()
    }
  })

  const stream = duplexify(writable, readable)

  /** @type {AbstractLevelDOWN & { createRpcStream: () => Duplex }} */
  // eslint-disable-next-line -- Eveything is messed up when no typings.
  const db = leveldown({})

  const client = db.createRpcStream()
  stream.on('close', () => {
    client.destroy()
  })

  pipeline(stream, client, stream, () => {
    stream.destroy()
  })

  return db
}

/**
 * @template K - Key
 * @template V - Value
 *
 * @extends {AbstractLevelDOWN<K,V>}
 */
class IpcLevelDown extends AbstractLevelDOWN {
  /** @readonly */
  #dbPromise
  // #handle

  /** @type {AbstractLevelDOWN | null} */
  #db = null

  // /** @type {AbstractLevelDOWN['status']} */
  // #status = 'new'

  /**
   * @param {string} name
   */
  constructor(name) {
    super(name)

    this.#dbPromise = openDatabase(name)
  }

  /**
   * @param {ErrorCallback} cb
   * @protected
   */
  _close(cb) {
    if (this.#db == null) {
      cb(new Error('Not ready'))
    } else {
      this.#db.close((error) => {
        if (error == null) cb(undefined)
        else cb(error)
      })
    }
  }

  /**
   * @param  {[AbstractOpenOptions, ErrorCallback]|[ErrorCallback]} args
   * @protected
   */
  _open(...args) {
    const cb = args.length === 1 ? args[0] : args[1]
    const options = args.length === 2 ? args[0] : {}
    if (this.#db != null) {
      cb(undefined)
      return
    }

    this.#dbPromise
      .then((db) => {
        this.#db = db
        db.open(options, cb)
        return null
      })
      .catch(
        /** @param {unknown} cause */
        (cause) => {
          // eslint-disable-next-line promise/no-callback-in-promise -- Required by design
          cb(toError(cause))
        }
      )
  }

  /**
   * @param {K} key
   * @param {[AbstractGetOptions, ErrorValueCallback<V>]|[ErrorValueCallback<V>]} args
   * @protected
   */
  _get(key, ...args) {
    const cb = args.length === 1 ? args[0] : args[1]
    const options = args.length === 2 ? args[0] : {}
    if (this.#db == null) {
      cb(new Error('Not ready'), /** @type {never} */ (undefined))
    } else {
      this.#db.get(key, options, cb)
    }
  }

  /**
   * @param {K} key
   * @param {V} value
   * @param {[AbstractOptions, ErrorCallback]|[ErrorCallback]} args
   * @protected
   */
  _put(key, value, ...args) {
    const cb = args.length === 1 ? args[0] : args[1]
    const options = args.length === 2 ? args[0] : {}
    if (this.#db == null) {
      cb(new Error('Not ready'))
    } else {
      this.#db.put(key, value, options, cb)
    }
  }

  /**
   * @param {K} key
   * @param {[AbstractOptions, ErrorCallback]|[ErrorCallback]} args
   * @protected
   */
  _del(key, ...args) {
    const cb = args.length === 1 ? args[0] : args[1]
    const options = args.length === 2 ? args[0] : {}
    if (this.#db == null) {
      cb(new Error('Not ready'))
    } else {
      this.#db.del(key, options, cb)
    }
  }

  /**
   * @param {K[]} keys
   * @param {[AbstractGetOptions, ErrorValueCallback<V[]>]|[ErrorValueCallback<V[]>]} args
   * @protected
   */
  _getMany(keys, ...args) {
    const cb = args.length === 1 ? args[0] : args[1]
    const options = args.length === 2 ? args[0] : {}
    if (this.#db == null) {
      cb(new Error('Not ready'), /** @type {never} */ (undefined))
    } else {
      this.#db.getMany(keys, options, cb)
    }
  }

  /**
   * @param  {[]|[AbstractBatch<K,V>[], ErrorCallback]|[AbstractBatch<K,V>[], AbstractOptions, ErrorCallback]} args
   * @protected
   */
  _batch(...args) {
    if (args.length !== 0) {
      const batch = args[0]
      const cb = args.length === 2 ? args[1] : args[2]
      const options = args.length === 3 ? args[1] : {}
      if (this.#db == null) cb(new Error('Not ready'))
      else this.#db.batch(batch, options, cb)
      return undefined
    } else if (this.#db == null) {
      throw new Error('Not ready')
    } else {
      return this.#db.batch()
    }
  }

  /**
   * @param {AbstractIteratorOptions<K>} options
   * @protected
   */
  _iterator(options) {
    if (this.#db == null) throw new Error('Not ready')
    return this.#db.iterator(options)
  }

  /**
   * @protected
   */
  _isOperational() {
    return this.#db != null
  }
}

export const useLevelDb = memo(() => {
  /**
   * @param {string} name
   */
  const connectSync = (name) => new IpcLevelDown(name)

  /**
   *
   * @template K
   * @template V
   * @param {string} name
   */
  const levelup_ = async (name) =>
    await openDatabase(name).then(
      async (db) =>
        await new Promise(
          /**
           * @param {(db: LevelUp<AbstractLevelDOWN<K, V>, AbstractIterator<K,V>>) => void} resolve
           * @param {(error: Error) => void} reject
           */
          (resolve, reject) => {
            /**
             * @param {Error|undefined} error
             */
            const cb = (error) => {
              if (error == null) resolve(up)
              else reject(error)
            }

            /** @type {LevelUp<AbstractLevelDOWN<K, V>, AbstractIterator<K,V>>} */
            const up = levelup(db, cb)
          }
        )
    )

  return {
    connectSync,
    connect: openDatabase,
    levelup: levelup_
  }
})

export const useLevelAdapter = memo(() => {
  const { connectSync } = useLevelDb()

  /** @typedef {Record<string, unknown>} LevelPouch */

  /**
   *
   * @this {Partial<LevelPouch>}
   * @param {*} opts
   * @param {(error?: Error | undefined) => void} cb
   */
  function MainDown(opts, cb) {
    // eslint-disable-next-line -- Eveything is messed up when no typings.
    LevelPouch.call(this, { ...opts, db: connectSync }, cb)
  }

  MainDown.valid = function () {
    return true
  }

  MainDown.use_prefix = true

  /** @type {PouchDB.Plugin<PouchDB.Static>} */
  const plugin = (pouch) => {
    // @ts-expect-error -- Not defined in the types.
    // eslint-disable-next-line -- Eveything is messed up when no typings.
    pouch.adapter('maindb', MainDown, true)
  }

  return plugin
})
