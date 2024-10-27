import Logger from 'electron-log'
import type { IpcResponse } from '../preload/api'
import type { MaybePromise } from '@/basics'
import type { IpcMainInvokeEvent } from 'electron'
import { toError } from '@/error-handling'

export const ipcProxy = <Args extends unknown[], Result>(fn: (...args: Args) => MaybePromise<Result>) =>
  async function ipcProxied(...[, ...args]: [IpcMainInvokeEvent, ...Args]): Promise<IpcResponse<Result>> {
    try {
      return { value: await fn(...args) }
    } catch (e) {
      return { error: toError(e) }
    }
  }

export const ipcHandle = <Args extends unknown[], Result>(
  fn: (ev: IpcMainInvokeEvent, ...args: Args) => MaybePromise<Result>
) =>
  async function ipcHandled(ev: IpcMainInvokeEvent, ...args: Args): Promise<IpcResponse<Result>> {
    try {
      return { value: await fn(ev, ...args) }
    } catch (e) {
      return { error: toError(e) }
    }
  }

export function logError<E extends Error>(e: E) {
  Logger.error(e)
  return e
}

export function isNodeError(value: unknown): value is NodeJS.ErrnoException
export function isNodeError<E extends new (...args: any[]) => Error>(
  value: unknown,
  type: E
): value is InstanceType<E> & NodeJS.ErrnoException
export function isNodeError(value: unknown, type: new (...args: any[]) => Error = Error) {
  return value instanceof type && (value as NodeJS.ErrnoException).code != null
}
