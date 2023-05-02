import type { IpsResponse } from '@preload/api'
import type { IpcMainInvokeEvent } from 'electron'

export const getDefault = <T> ({ default: d }: { default: T }) => d
export const ipcProxy = <Args extends unknown[], Result> (fn: (...args: Args) => Result | Promise<Result>) =>
  async (...[, ...args]: [IpcMainInvokeEvent, ...Args]): Promise<IpsResponse<Result>> => {
    try {
      return { value: await fn(...args) }
    } catch (e) {
      return { error: e instanceof Error ? e : new Error(String(e)) }
    }
  }

export const ipcHandle = <Args extends unknown[], Result> (fn: (ev: IpcMainInvokeEvent, ...args: Args) => Result | Promise<Result>) =>
  async (ev: IpcMainInvokeEvent, ...args: Args): Promise<IpsResponse<Result>> => {
    try {
      return { value: await fn(ev, ...args) }
    } catch (e) {
      return { error: e instanceof Error ? e : new Error(String(e)) }
    }
  }
