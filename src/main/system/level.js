import { Duplex, PassThrough, pipeline, Writable } from 'node:stream'
import { ipcMain } from 'electron'
import Logger from 'electron-log'
import level from 'level'
// @ts-expect-error -- No types
import multileveldown from 'multileveldown'
import { ipcHandle } from '../utilities.js'
import useHandles from './handle.js'

/** @typedef {`level:${string}`} Channel */

export default function useLevelServer() {
  /** @type {import('./handle.js').HandleKey<{ channel: Channel; stream: import('node:stream').Duplex }>} */
  // @ts-expect-error -- Casting
  const kLevelDatabaseHandle = Symbol.for('@level')
  const { createHandle, openHandle } = useHandles()

  const open = ipcHandle(
    /**
     * @param {string} name
     */
    async (event, name) => {
      if (name.endsWith(':close')) {
        throw new SyntaxError("Database names cannot end in ':close'")
      }

      const sender = event.sender

      const db = level(name)
      // eslint-disable-next-line -- No types, mo errors.
      const host = multileveldown.server(db)
      /** @type {Channel} */
      const channel = `level:${name}`

      const readable = new PassThrough({
        destroy: () => {
          db.close().catch(
            /**
             * @param {unknown} e
             */
            e => {
              /* v8 ignore next 1 --Rarely reached over IPC. */
              Logger.error(e)
            }
          )
        }
      })
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
        ipcMain.off(channel, receiver)
        event.sender.send(`${channel}:close`, channel)
        // eslint-disable-next-line -- No types, mo errors.
        host.destroy()
        await db.close()
      })

      return await Promise.resolve(handle)
    }
  )

  const getChannel = ipcHandle(
    /**
     * @param {import('../../preload/api.js').Handle} handle
     * @returns
     */
    async (event, handle) => {
      const { channel } = openHandle(event, kLevelDatabaseHandle, handle)
      return await Promise.resolve(channel)
    }
  )

  ipcMain.handle('database:open', open)
  ipcMain.handle('database:channel', getChannel)
}