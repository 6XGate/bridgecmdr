import { Duplex, PassThrough, pipeline, Writable } from 'stream'
// @ts-expect-error -- No types
import multileveldown from 'multileveldown'
// @ts-expect-error -- No types
import LevelPouch from 'pouchdb-adapter-leveldb-core'
import { memo } from 'radash'
import useBridgedApi from '../system/bridged'
import useHandles from '../system/handles'

export const useLevelDb = memo(() => {
  const { level } = useBridgedApi()
  const { freeHandle } = useHandles()

  /**
   * @param {string} name
   */
  const connect = async name => {
    const h = await level.open(name)

    const readable = new PassThrough({
      destroy: () => {
        freeHandle(h).catch(
          /**
           * @param {unknown} e
           */
          /* v8 ignore next 3 --Rarely reached over IPC. */
          e => {
            console.error(e)
          }
        )
      }
    })
    const sender = await level.activate(h, message => {
      readable.write(message)
    })

    const writable = new Writable({
      write: (chunk, _, next) => {
        sender(chunk)
        next()
      }
    })

    const stream = Duplex.from({ writable, readable })

    /** @type {import('levelup').LevelUp & { connect: () => import('stream').Duplex }} */
    // eslint-disable-next-line -- Eveything is messed up when no typings.
    const db = multileveldown.client()
    const client = db.connect()
    stream.on('close', () => {
      client.destroy()
    })

    pipeline(stream, client, stream, () => {
      stream.destroy()
    })

    await db.open()

    return db
  }

  return {
    connect
  }
})

export const useLevelAdapter = memo(() => {
  const { connect } = useLevelDb()

  /** @typedef {Record<string, unknown>} LevelPouch */

  /**
   *
   * @this {Partial<LevelPouch>}
   * @param {*} opts
   * @param {(error?: Error | undefined) => void} cb
   */
  function MainDown(opts, cb) {
    // eslint-disable-next-line -- Eveything is messed up when no typings.
    LevelPouch.call(this, { ...opts, db: connect }, cb)
  }

  MainDown.valid = function () {
    return true
  }

  MainDown.use_prefix = true

  /** @type {PouchDB.Plugin<PouchDB.Static>} */
  const plugin = pouch => {
    // @ts-expect-error -- Not defined in the types.
    // eslint-disable-next-line -- Eveything is messed up when no typings.
    pouch.adapter('maindb', MainDown, true)
  }

  return plugin
})
