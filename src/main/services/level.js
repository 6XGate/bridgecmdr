import { resolve as resolvePath } from 'node:path'
import { Duplex, PassThrough, pipeline, Writable } from 'node:stream'
import { app, ipcMain } from 'electron'
import level from 'level'
// @ts-expect-error -- No types
import multileveldown from 'multileveldown'
import { memo } from 'radash'
import { ipcHandle, logError } from '../utilities'
import useHandles from './handle'

/** @typedef {`level:${string}`} Channel */
/** @typedef {import('level').LevelDB} LevelDB */

const useLevelServer = memo(function useLevelServer() {
  const kLevelDatabaseHandle =
    /** @type {import('./handle').HandleKey<{ channel: Channel; stream: import('node:stream').Duplex }>} */
    (Symbol.for('@level'))
  const { createHandle, openHandle } = useHandles()

  /**
   * @param {string} path
   */
  async function openDatabase(path) {
    return await new Promise(
      /**
       *
       * @param {(db: LevelDB) => void} resolve
       * @param {(error: Error | undefined) => void} reject
       */
      (resolve, reject) => {
        const db = level(path, {}, (error) => {
          if (error == null) resolve(db)
          else reject(error)
        })
      }
    )
  }

  const open = ipcHandle(
    /**
     * @param {string} name
     */
    async function open(event, name) {
      if (name.endsWith(':close')) {
        throw logError(new SyntaxError("Database names cannot end in ':close'"))
      }

      // Don't allow any path separating characters.
      if (/[/\\.:]/u.test(name)) {
        throw logError(new Error('Only a file name, without extension or relative path, may be specified'))
      }

      const path = resolvePath(app.getPath('userData'), name)

      const sender = event.sender

      const db = await openDatabase(path)
      // eslint-disable-next-line -- No types, mo errors.
      const host = multileveldown.server(db)
      /** @type {Channel} */
      const channel = `level:${name}`

      const readable = new PassThrough()
      const writable = new Writable({
        write: (chunk, _, next) => {
          sender.send(channel, chunk)
          next()
        }
      })

      const stream = Duplex.from({ writable, readable })
      /**
       * @param {*} _
       * @param {unknown} msg
       */
      const receiver = (_, msg) => {
        readable.write(msg)
      }

      ipcMain.on(channel, receiver)
      pipeline(stream, host, stream, () => {
        stream.destroy()
      })

      const handle = createHandle(event, kLevelDatabaseHandle, { channel, stream }, async () => {
        await db.close()

        // eslint-disable-next-line -- No types, mo errors.
        host.destroy()
        ipcMain.off(channel, receiver)
        if (!event.sender.isDestroyed()) event.sender.send(`${channel}:close`)
      })

      return await Promise.resolve(handle)
    }
  )

  const getChannel = ipcHandle(
    /**
     * @param {import('../../preload/api').Handle} handle
     * @returns
     */
    async function getChannel(event, handle) {
      const { channel } = openHandle(event, kLevelDatabaseHandle, handle)
      return await Promise.resolve(channel)
    }
  )

  ipcMain.handle('database:open', open)
  ipcMain.handle('database:channel', getChannel)
})

export default useLevelServer
