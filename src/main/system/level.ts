import { Buffer } from 'node:buffer'
import { resolve as resolvePath } from 'node:path'
import is from '@sindresorhus/is'
import { app } from 'electron'
import log from 'electron-log'
import LevelDOWN from 'leveldown'
import { memo } from 'radash'
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

const kLevelHandle = Symbol('@leveldb') as HandleKey<LevelDown>
const kIteratorHandle = Symbol('@levelIter') as HandleKey<LevelDownIterator>

type CallbackArg<Result> = Result extends unknown[] ? Result : []
type ErrorCallback<Results> = (err: Error | undefined, ...args: CallbackArg<Results>) => void
const makeAsync = async <Results = void> (fn: (resolver: ErrorCallback<Results>) => void) =>
  await new Promise<Results>((resolve, reject) => {
    fn((error, ...args: CallbackArg<Results>) => {
      error != null
        ? reject(error)
        : resolve(args as never)
    })
  })

const bufferize = (value: unknown) => {
  if (typeof value === 'string' || value instanceof Buffer) {
    return value
  }

  if (is.typedArray(value)) {
    return Buffer.from(value.buffer)
  }

  throw new TypeError('Only string and buffers can be used as keys and values')
}

const useLevelDown = memo(() => {
  const { createHandle, openHandle, freeHandle } = useHandles()

  const connect = async (location: string) => {
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

  const open = async (h: Handle, options?: LevelDownOpenOptions) => {
    await makeAsync(cb => {
      const db = openHandle(kLevelHandle, h)
      options != null
        ? db.open(options, cb)
        : db.open(cb)
    })
  }

  const close = async (h: Handle) => {
    await freeHandle(h)
  }

  const get = async (h: Handle, key: Bytes, options?: LevelDownGetOptions) =>
    await makeAsync<[Bytes]>(cb => {
      const db = openHandle(kLevelHandle, h)
      options != null
        ? db.get(bufferize(key), options, cb)
        : db.get(bufferize(key), cb)
    })

  const getMany = async (h: Handle, keys: Bytes[], options?: LevelDownGetOptions) =>
    await makeAsync<[Bytes[]]>(cb => {
      const db = openHandle(kLevelHandle, h)
      options != null
        ? db.getMany(keys.map(bufferize), options, cb)
        : db.getMany(keys.map(bufferize), cb)
    })

  const put = async (h: Handle, key: Bytes, value: Bytes, options?: LevelDownPutOptions) => {
    await makeAsync(cb => {
      const db = openHandle(kLevelHandle, h)
      options != null
        ? db.put(bufferize(key), bufferize(value), options, cb)
        : db.put(bufferize(key), bufferize(value), cb)
    })
  }

  const del = async (h: Handle, key: Bytes, options?: LevelDownDelOptions) => {
    await makeAsync(cb => {
      const db = openHandle(kLevelHandle, h)
      options != null
        ? db.del(bufferize(key), options, cb)
        : db.del(bufferize(key), cb)
    })
  }

  const batch = async (h: Handle, array: AbstractBatch[], options?: LevelDownBatchOptions) => {
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

  const clear = async (h: Handle, options?: LevelDownClearOptions) => {
    await makeAsync(cb => {
      const db = openHandle(kLevelHandle, h)
      options != null
        ? db.clear(options, cb)
        : db.clear(cb)
    })
  }

  const approximateSize = async (h: Handle, start: Bytes, end: Bytes) =>
    await makeAsync<[number]>(cb => {
      const db = openHandle(kLevelHandle, h)
      db.approximateSize(start, end, cb)
    })

  const compactRange = async (h: Handle, start: Bytes, end: Bytes) => {
    await makeAsync(cb => {
      const db = openHandle(kLevelHandle, h)
      db.compactRange(start, end, cb)
    })
  }

  const iterator = async (h: Handle, options?: LevelDownIteratorOptions) => {
    const db = openHandle(kLevelHandle, h)
    const iter = db.iterator(options)

    return await Promise.resolve(createHandle(kIteratorHandle, iter, () => undefined))
  }

  const next = async (h: Handle) =>
    await makeAsync<[key: Bytes, value: Bytes]>(cb => {
      const iter = openHandle(kIteratorHandle, h)
      iter.next(cb)
    })

  const end = async (h: Handle) => {
    await makeAsync(cb => {
      const iter = openHandle(kIteratorHandle, h)
      iter.end(cb)
    })

    await freeHandle(h)
  }

  const seek = async (h: Handle, key: Bytes) => {
    const iter = openHandle(kIteratorHandle, h)
    iter.seek(key)

    await Promise.resolve()
  }

  return {
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
      next,
      end,
      seek
    }
  } satisfies LevelProxyApi
})

export default useLevelDown
