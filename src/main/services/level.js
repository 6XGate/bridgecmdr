import { resolve as resolvePath } from 'node:path'
import { app } from 'electron'
import Logger from 'electron-log'
import levelDown from 'leveldown'
import levelUp from 'levelup'
// @ts-expect-error -- No types
import LevelPouch from 'pouchdb-adapter-leveldb-core'
import { memo } from 'radash'

/* globals PouchDB */ // Fixes PouchDB undefined in JSDoc.

//
// NOTE: While PouchDB has a built-in LevelDB adapter, we want to have
// as minimum of an external footprint as possible. This will be
// done by using our own quick-and-dirty adapter that just
// uses the PouchDB built in adapter.
//

/** @template ALD @typedef {import('levelup').LevelUp<ALD>} LevelUp<ALD> */
/** @typedef {(err: Error | undefined) => void} ErrorCallback */
/** @typedef {import('leveldown').LevelDown} LevelDown */

export const useLevelDb = memo(function useLevelDb() {
  const leveldown = memo(
    /**
     * @param {string} name The name of the database.
     */
    function leveldown(name) {
      const path = resolvePath(app.getPath('userData'), name)
      const db = levelDown(path)
      app.on('will-quit', () => {
        db.close((err) => {
          /* v8 ignore next 1 */ // No way to spy or mock this deep in.
          if (err != null) Logger.error(err)
        })
      })

      return db
    }
  )

  const levelup = memo(
    /**
     * @param {string} name The name of the database.
     */
    async function levelup(name) {
      const db = leveldown(name)
      return await new Promise(
        /* eslint-disable jsdoc/no-undefined-types -- Has issue with generics. */
        /**
         * @param {(db: LevelUp<LevelDown>) => void} resolve Resolver
         * @param {(error: Error) => void} reject Rejecter
         */
        /* eslint-enable jsdoc/no-undefined-types */
        (resolve, reject) => {
          /**
           * @param {Error|undefined} error Error
           */
          const cb = (error) => {
            /* v8 ignore next 2 */ // No way to spy or mock this deep in.
            if (error == null) resolve(up)
            else reject(error)
          }

          const up = levelUp(db, cb)
        }
      )
    }
  )

  return {
    leveldown,
    levelup
  }
})

export const useLevelAdapter = memo(function useLevelAdapter() {
  const { leveldown } = useLevelDb()

  /** @typedef {Record<string, unknown>} LevelPouch */

  /**
   * @this {Partial<LevelPouch>}
   * @param {Record<string, unknown>} opts Plugin options
   * @param {ErrorCallback} cb Error callback
   */
  function MainDown(opts, cb) {
    // eslint-disable-next-line -- Everything is messed up with no typings.
    LevelPouch.call(this, { ...opts, db: leveldown }, cb)
  }

  MainDown.valid = function () {
    return true
  }

  MainDown.use_prefix = true

  /** @type {PouchDB.Plugin<PouchDB.Static>} */
  const plugin = (pouch) => {
    // @ts-expect-error -- Not defined in the types.
    // eslint-disable-next-line -- Everything is messed up with no typings.
    pouch.adapter('maindb', MainDown, true)
  }

  return plugin
})
