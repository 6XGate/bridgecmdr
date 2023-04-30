/* eslint-disable promise/always-return -- We are converting back to callbacks */
/* eslint-disable promise/no-callback-in-promise -- We are converting back to callbacks */
import is from '@sindresorhus/is'
import log from 'electron-log'
import LevelPouch from 'pouchdb-adapter-leveldb-core'
import { memo } from 'radash'
import useBridgedApi from '@/system/bridged'
import type {
  AbstractBatch,
  AbstractChainedBatch,
  ErrorValueCallback,
  ErrorCallback,
  ErrorKeyValueCallback
} from 'abstract-leveldown'
import type {
  Bytes,
  ErrorSizeCallback,
  LevelDown,
  LevelDownBatchOptions,
  LevelDownClearOptions,
  LevelDownDelOptions,
  LevelDownGetOptions,
  LevelDownIterator,
  LevelDownIteratorOptions,
  LevelDownOpenOptions,
  LevelDownPutOptions
} from 'leveldown'
import type { Merge } from 'type-fest'

export const useLevelDb = memo(() => {
  const api = useBridgedApi()
  const toError = (e: unknown) => (e instanceof Error ? e : new Error(String(e)))

  const sanitize = <T> (value?: T) =>
    (value !== undefined
      ? JSON.parse(JSON.stringify(value)) as T
      : undefined)

  const useChainCommon = <T> (self: () => T, written: () => boolean) => {
    const operations: AbstractBatch[] = []

    const checkKey = (key: unknown) => {
      if (key == null) {
        throw new Error('key cannot be an null or undefined')
      }

      if (is.arrayLike(key) && key.length === 0) {
        throw new Error('key cannot be an empty')
      }
    }

    const checkValue = (value: unknown) => {
      if (value == null) {
        throw new Error('value cannot be an null or undefined')
      }
    }

    const checkWritten = () => {
      if (written()) {
        throw new Error('write() already called on this batch')
      }
    }

    const chainPut = (key: unknown, value: unknown) => {
      checkWritten()
      checkKey(key)
      checkValue(value)

      operations.push({ type: 'put', key, value })

      return self()
    }

    const chainDel = (key: unknown) => {
      checkWritten()
      checkKey(key)

      operations.push({ type: 'del', key })

      return self()
    }

    const chainClear = () => {
      checkWritten()

      operations.splice(0, operations.length - 1)

      return self()
    }

    const common = {
      put: chainPut,
      del: chainDel,
      clear: chainClear
    }

    return { checkKey, checkValue, checkWritten, common, operations }
  }

  /** Callback-based proxy, implementing the offical API. */
  const connect = (location: string) => {
    const handle = api.level.connect(location)
    let status: LevelDown['status'] = 'new'

    type OpenArgs =
      | [cb: ErrorCallback]
      | [options: LevelDownOpenOptions, cb: ErrorCallback]

    const handleUnload = () => { close(e => { log.error(e) }) }

    const open = (...args: OpenArgs) => {
      const oldStatus = status
      status = 'opening'
      const cb = args.length === 1 ? args[0] : args[1]
      const options = args.length === 2 ? sanitize(args[0]) : undefined
      handle
        .then(async h => { await api.level.open(h, options) })
        .then(() => { status = 'open' })
        .then(() => { cb(undefined) })
        .then(() => { window.addEventListener('beforeunload', handleUnload) })
        .catch(e => { status = oldStatus; cb(toError(e)) })
    }

    const close = (cb: ErrorCallback) => {
      const oldStatus = status
      status = 'closing'
      handle
        .then(async h => { await api.level.close(h) })
        .then(() => { status = 'closed' })
        .then(() => { cb(undefined) })
        .then(() => { window.removeEventListener('beforeunload', handleUnload) })
        .catch(e => { status = oldStatus; cb(toError(e)) })
    }

    type GetArgs =
      | [key: Bytes, cb: ErrorValueCallback<Bytes>]
      | [key: Bytes, options: LevelDownGetOptions, cb: ErrorValueCallback<Bytes>]

    const get = (...args: GetArgs) => {
      const cb = args.length === 2 ? args[1] : args[2]
      const options = args.length === 3 ? sanitize(args[1]) : undefined
      const key = args[0]
      handle
        .then(async h => await api.level.get(h, key, options))
        .then(([value]) => { cb(undefined, value) })
        .catch(e => { cb(toError(e), undefined as never) })
    }

    type GetManyArgs =
      | [keys: Bytes[], cb: ErrorValueCallback<Bytes[]>]
      | [keys: Bytes[], options: LevelDownGetOptions, cb: ErrorValueCallback<Bytes[]>]

    const getMany = (...args: GetManyArgs) => {
      const cb = args.length === 2 ? args[1] : args[2]
      const options = args.length === 3 ? sanitize(args[1]) : undefined
      const keys = args[0]
      handle
        .then(async h => await api.level.getMany(h, keys, options))
        .then(([value]) => { cb(undefined, value) })
        .catch(e => { cb(toError(e), undefined as never) })
    }

    type PutArgs =
      | [key: Bytes, value: Bytes, cb: ErrorCallback]
      | [key: Bytes, value: Bytes, options: LevelDownPutOptions, cb: ErrorCallback]
    const put = (...args: PutArgs) => {
      const cb = args.length === 3 ? args[2] : args[3]
      const options = args.length === 4 ? sanitize(args[2]) : undefined
      const value = args[1]
      const key = args[0]
      handle
        .then(async h => { await api.level.put(h, key, value, options) })
        .then(() => { cb(undefined) })
        .catch(e => { cb(toError(e)) })
    }

    type DelArgs =
      | [key: Bytes, cb: ErrorCallback]
      | [key: Bytes, options: LevelDownDelOptions, cb: ErrorCallback]
    const del = (...args: DelArgs) => {
      const cb = args.length === 2 ? args[1] : args[2]
      const options = args.length === 3 ? sanitize(args[1]) : undefined
      const key = args[0]
      handle
        .then(async h => { await api.level.del(h, key, options) })
        .then(() => { cb(undefined) })
        .catch(e => { cb(toError(e)) })
    }

    const chain = () => {
      let written = false
      const { checkWritten, common, operations } = useChainCommon(() => batcher, () => written)

      type WriteArgs =
        | [cb: ErrorCallback]
        | [options: LevelDownBatchOptions, cb: ErrorCallback]
      const chainWrite = (...args: WriteArgs) => {
        checkWritten()

        const cb = args.length === 1 ? args[0] : args[1]
        const options = args.length === 2 ? args[0] : undefined

        written = true
        options != null
          ? db.batch(operations, options, cb)
          : db.batch(operations, cb)
      }

      const batcher: AbstractChainedBatch = {
        ...common,
        write: chainWrite
      }

      return batcher
    }

    type BatchArgs =
      | []
      | [array: AbstractBatch[], cb: ErrorCallback]
      | [array: AbstractBatch[], options: LevelDownBatchOptions, cb: ErrorCallback]
    const batch = (...args: BatchArgs) => {
      if (args.length === 0) {
        return chain()
      }

      const cb = args.length === 2 ? args[1] : args[2]
      const options = args.length === 3 ? sanitize(args[1]) : undefined
      const array = args[0]

      handle
        .then(async h => { await api.level.batch(h, array, options) })
        .then(() => { cb(undefined) })
        .catch(e => { cb(toError(e)) })

      return chain()
    }

    type ClearArgs =
      | [cb: ErrorCallback]
      | [options: LevelDownClearOptions, cb: ErrorCallback]
    const clear = (...args: ClearArgs) => {
      const cb = args.length === 1 ? args[0] : args[1]
      const options = args.length === 2 ? sanitize(args[0]) : undefined
      handle
        .then(async h => { await api.level.clear(h, options) })
        .then(() => { cb(undefined) })
        .catch(e => { cb(toError(e)) })
    }

    const approximateSize = (start: Bytes, end: Bytes, cb: ErrorSizeCallback) => {
      handle
        .then(async h => await api.level.approximateSize(h, start, end))
        .then(([size]) => { cb(undefined, size) })
        .catch(e => { cb(toError(e), undefined as never) })
    }

    const compactRange = (start: Bytes, end: Bytes, cb: ErrorCallback) => {
      handle
        .then(async h => { await api.level.compactRange(h, start, end) })
        .then(() => { cb(undefined) })
        .catch(e => { cb(toError(e)) })
    }

    const iterator = (options?: LevelDownIteratorOptions) => {
      const iterHandle = handle
        .then(async h => await api.level.iterator(h, sanitize(options)))

      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Need to track any past operation.
      let ops = Promise.resolve<any>(undefined)
      let finished = false

      const next = (cb: ErrorKeyValueCallback<Bytes, Bytes>) => {
        ops = ops
          .then(async () => await iterHandle)
          .then(async h => await api.level.iteration.next(h))
          .then(([k, v]) => { cb(undefined, k, v) })
          .catch(e => { cb(toError(e), undefined as never, undefined as never) })

        return iter
      }

      const end = (cb: ErrorCallback) => {
        ops = ops
          .then(async () => await iterHandle)
          .then(async h => { await api.level.iteration.end(h) })
          .then(() => { cb(undefined) })
          .then(() => { finished = true })
          .catch(e => { cb(toError(e)) })
      }

      const seek = (key: Bytes) => {
        ops = ops
          .then(async () => await iterHandle)
          .then(async h => { await api.level.iteration.seek(h, key) })
      }

      const iter: LevelDownIterator = {
        db,
        next,
        end,
        seek,
        get binding () { return null },
        get cache () { return null },
        get finished () { return finished },
        get fastFuture () { return null }
      }

      return iter
    }

    const db: LevelDown = {
      get status () { return status },
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
      getProperty: () => { throw new Error('Not implement') },
      iterator,
      isOperational: () => status === 'open'
    }

    return db
  }

  /** Promise-base proxy, similar to the official API. */
  const level = async (location: string, openOptions?: LevelDownOpenOptions) => {
    let status: LevelDown['status'] = 'new'
    const handle = await api.level.connect(location)
    status = 'opening'
    try {
      await api.level.open(handle, sanitize(openOptions))
      status = 'open'
    } catch (e) {
      status = 'new'
      throw e
    }

    const close = async () => {
      const oldStatus = status
      status = 'closing'
      try {
        await api.level.close(handle)
        status = 'closed'
      } catch (e) {
        status = oldStatus
        throw e
      }
    }

    const get = async (key: Bytes, options?: LevelDownGetOptions) =>
      await api.level.get(handle, key, sanitize(options)).then(v => v[0])

    const getMany = async (keys: Bytes[], options?: LevelDownGetOptions) =>
      await api.level.getMany(handle, keys, sanitize(options)).then(v => v[0])

    const put = async (key: Bytes, value: Bytes, options?: LevelDownPutOptions) => {
      await api.level.put(handle, key, value, sanitize(options))
    }

    const del = async (key: Bytes, options?: LevelDownDelOptions) => {
      await api.level.del(handle, key, sanitize(options))
    }

    type AsyncAbstractChainedBatch = Merge<AbstractChainedBatch, {
      write: (options?: LevelDownBatchOptions) => Promise<void>
    }>

    const chain = () => {
      let written = false
      const { checkWritten, common, operations } = useChainCommon(() => batcher, () => written)

      const chainWrite = async (options?: LevelDownBatchOptions) => {
        checkWritten()

        written = true
        await db.batch(operations, options)
      }

      const batcher: AsyncAbstractChainedBatch = {
        ...common,
        write: chainWrite
      }

      return batcher
    }

    const batch = async (operations?: AbstractBatch[], options?: LevelDownBatchOptions) => {
      if (operations == null) {
        return chain()
      }

      await api.level.batch(handle, operations, options)

      return chain()
    }

    const clear = async (options?: LevelDownClearOptions) => {
      await api.level.clear(handle, sanitize(options))
    }

    const approximateSize = async (start: Bytes, end: Bytes) =>
      await api.level.approximateSize(handle, start, end).then(v => v[0])

    const compactRange = async (start: Bytes, end: Bytes) => {
      await api.level.compactRange(handle, start, end)
    }

    type IterResult = [key: Bytes, value: Bytes]
    const iterator = (options?: LevelDownIteratorOptions) => {
      const iterHandle = api.level.iterator(handle, sanitize(options))

      let finished = false
      const checkFinished = (op: string) => {
        if (finished) {
          throw new Error(`Called ${op} after return()`)
        }
      }

      const iterNext = async (): Promise<IteratorResult<IterResult, void>> => {
        checkFinished('next')

        // Result can be completely undefined, regardless of typing.
        const value = await api.level.iteration.next(await iterHandle)
        if (value as unknown == null || value[0] as unknown == null || value[1] as unknown == null) {
          return { done: true, value: undefined }
        }

        return { value }
      }

      const iterReturn = async (): Promise<IteratorResult<IterResult, void>> => {
        checkFinished('return')

        await api.level.iteration.end(await iterHandle)
        finished = true

        return { done: true, value: undefined }
      }

      const seek = async (key: Bytes) => {
        checkFinished('seek')

        await api.level.iteration.seek(await iterHandle, key)
      }

      const iter: AsyncIterableIterator<IterResult> & { seek: typeof seek } = {
        next: iterNext,
        return: iterReturn,
        seek,
        [Symbol.asyncIterator]: () => iter
      }

      return iter
    }

    const db = {
      get status () { return status },
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
      [Symbol.asyncIterator]: () => iterator(),
      isOperational: () => status === 'open'
    }

    return db
  }

  return {
    connect,
    level
  }
})

export const useLevelDbAdapter = memo(() => {
  const { connect } = useLevelDb()
  type Options = { db: LevelDown } & Record<string, unknown>

  function MainDown (this: Partial<LevelPouch>, opts: Options, cb: (error?: Error) => void) {
    LevelPouch.call(this, { ...opts, db: connect }, cb)
  }

  MainDown.valid = function () {
    return true
  }

  MainDown.use_prefix = true

  const plugin: PouchDB.Plugin<PouchDB.Static> = pouch => {
    pouch.adapter('maindb', MainDown, true)
  }

  return plugin
})

const MainDownPlugin = useLevelDbAdapter()
export default MainDownPlugin
