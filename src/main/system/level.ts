import { Buffer } from 'node:buffer'
import { resolve as resolvePath } from 'node:path'
import is from '@sindresorhus/is'
import { app, ipcMain } from 'electron'
import LevelDOWN from 'leveldown'
import { memo } from 'radash'
import useLogging from '@main/plugins/log'
import { ipcProxy } from '@main/utilities'
import useHandles from './handle'
import type { HandleKey } from './handle'
import type { Handle, LevelProxyApi } from '@preload/api'
import type { AbstractBatch } from 'abstract-leveldown'
import type {
  Bytes,
  LevelDownGetOptions,
  LevelDownOpenOptions,
  LevelDownBatchOptions,
  LevelDownClearOptions,
  LevelDownDelOptions,
  LevelDownPutOptions,
  LevelDown,
  LevelDownIterator,
  LevelDownIteratorOptions
} from 'leveldown'

const useLevelDown = memo(() => {
  const log = useLogging()

  const { createHandle, openHandle, freeHandle } = useHandles()
  const kLevelHandle = Symbol('@leveldb') as HandleKey<LevelDown>
  const kIteratorHandle = Symbol('@levelIter') as HandleKey<LevelDownIterator>

  type CallbackArg<Result> = Result extends unknown[] ? Result : []
  type ErrorCallback<Results> = (err: Error | undefined, ...args: CallbackArg<Results>) => void
  async function makeAsync<Results = void> (fn: (resolver: ErrorCallback<Results>) => void) {
    return await new Promise<Results>((resolve, reject) => {
      fn((error, ...args: CallbackArg<Results>) => {
        error != null
          ? reject(error)
          : resolve(args as never)
      })
    })
  }

  function bufferize (value: unknown) {
    if (typeof value === 'string' || value instanceof Buffer) {
      return value
    }

    if (is.typedArray(value)) {
      return Buffer.from(value.buffer)
    }

    throw new TypeError('Only string and buffers can be used as keys and values')
  }

  async function connect (location: string) {
    // Don't allow any path separating characters.
    if ((/[/\\.:]/u).test(location)) {
      throw new Error('Only a file name, without extension or relative path, may be specified')
    }

    const path = resolvePath(app.getPath('userData'), location)

    const db = LevelDOWN(path)

    return await Promise.resolve(createHandle(kLevelHandle, db, async () => {
      await new Promise<void>((resolve, reject) => {
        db.close(error => {
          if (error != null) {
            log.error(`Failed to close database "${location}"`, error)
            reject(error)

            return
          }

          resolve()
        })
      })
    }))
  }

  async function open (h: Handle, options?: LevelDownOpenOptions) {
    await makeAsync(cb => {
      const db = openHandle(kLevelHandle, h)
      options != null
        ? db.open(options, cb)
        : db.open(cb)
    })
  }

  async function close (h: Handle) {
    await freeHandle(h)
  }

  async function get (h: Handle, key: Bytes, options?: LevelDownGetOptions) {
    return await makeAsync<[Bytes]>(cb => {
      const db = openHandle(kLevelHandle, h)
      options != null
        ? db.get(bufferize(key), options, cb)
        : db.get(bufferize(key), cb)
    })
  }

  async function getMany (h: Handle, keys: Bytes[], options?: LevelDownGetOptions) {
    return await makeAsync<[Bytes[]]>(cb => {
      const db = openHandle(kLevelHandle, h)
      options != null
        ? db.getMany(keys.map(bufferize), options, cb)
        : db.getMany(keys.map(bufferize), cb)
    })
  }

  async function put (h: Handle, key: Bytes, value: Bytes, options?: LevelDownPutOptions) {
    await makeAsync(cb => {
      const db = openHandle(kLevelHandle, h)
      options != null
        ? db.put(bufferize(key), bufferize(value), options, cb)
        : db.put(bufferize(key), bufferize(value), cb)
    })
  }

  async function del (h: Handle, key: Bytes, options?: LevelDownDelOptions) {
    await makeAsync(cb => {
      const db = openHandle(kLevelHandle, h)
      options != null
        ? db.del(bufferize(key), options, cb)
        : db.del(bufferize(key), cb)
    })
  }

  async function batch (h: Handle, array: AbstractBatch[], options?: LevelDownBatchOptions) {
    await makeAsync(cb => {
      const db = openHandle(kLevelHandle, h)
      const ops = array.map(op => {
        if (op.type === 'put' && op.value != null) {
          return { ...op, key: bufferize(op.key), value: bufferize(op.value) }
        }

        return op
      })

      options != null
        ? db.batch(ops, options, cb)
        : db.batch(ops, cb)
    })
  }

  async function clear (h: Handle, options?: LevelDownClearOptions) {
    await makeAsync(cb => {
      const db = openHandle(kLevelHandle, h)
      options != null
        ? db.clear(options, cb)
        : db.clear(cb)
    })
  }

  async function approximateSize (h: Handle, start: Bytes, end: Bytes) {
    return await makeAsync<[number]>(cb => {
      const db = openHandle(kLevelHandle, h)
      db.approximateSize(start, end, cb)
    })
  }

  async function compactRange (h: Handle, start: Bytes, end: Bytes) {
    await makeAsync(cb => {
      const db = openHandle(kLevelHandle, h)
      db.compactRange(start, end, cb)
    })
  }

  async function iterator (h: Handle, options?: LevelDownIteratorOptions) {
    const db = openHandle(kLevelHandle, h)
    const iter = db.iterator(options)

    return await Promise.resolve(createHandle(kIteratorHandle, iter, () => undefined))
  }

  async function iteratorNext (h: Handle) {
    return await makeAsync<[key: Bytes, value: Bytes]>(cb => {
      const iter = openHandle(kIteratorHandle, h)
      iter.next(cb)
    })
  }

  async function iteratorEnd (h: Handle) {
    await makeAsync(cb => {
      const iter = openHandle(kIteratorHandle, h)
      iter.end(cb)
    })

    await freeHandle(h)
  }

  async function iteratorSeek (h: Handle, key: Bytes) {
    const iter = openHandle(kIteratorHandle, h)
    iter.seek(key)

    await Promise.resolve()
  }

  const api = {
    connect,
    open,
    close,
    get,
    getMany,
    put,
    del,
    batch,
    clear,
    approximateSize,
    compactRange,
    iterator,
    iteration: {
      next: iteratorNext,
      end: iteratorEnd,
      seek: iteratorSeek
    }
  } satisfies LevelProxyApi

  ipcMain.handle('leveldb:connect', ipcProxy(api.connect))
  ipcMain.handle('leveldb:open', ipcProxy(api.open))
  ipcMain.handle('leveldb:close', ipcProxy(api.close))
  ipcMain.handle('leveldb:get', ipcProxy(api.get))
  ipcMain.handle('leveldb:getMany', ipcProxy(api.getMany))
  ipcMain.handle('leveldb:put', ipcProxy(api.put))
  ipcMain.handle('leveldb:del', ipcProxy(api.del))
  ipcMain.handle('leveldb:batch', ipcProxy(api.batch))
  ipcMain.handle('leveldb:clear', ipcProxy(api.clear))
  ipcMain.handle('leveldb:approximateSize', ipcProxy(api.approximateSize))
  ipcMain.handle('leveldb:compactRange', ipcProxy(api.compactRange))
  ipcMain.handle('leveldb:iterator', ipcProxy(api.iterator))
  ipcMain.handle('leveldb:iterator:next', ipcProxy(api.iteration.next))
  ipcMain.handle('leveldb:iterator:end', ipcProxy(api.iteration.end))
  ipcMain.handle('leveldb:iterator:seek', ipcProxy(api.iteration.seek))

  return api
})

export default useLevelDown
