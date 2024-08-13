import { ipcRenderer } from 'electron'
import type { IpcResponse, ListenerOptions } from './api.js'
import type { IpcRendererEvent } from 'electron'

const useIpc = () => {
  const useInvoke =
    <Id extends string, Args extends unknown[], Result>(id: Id) =>
    async (...args: Args) => {
      const response = (await ipcRenderer.invoke(id, ...args)) as IpcResponse<Result>
      if (response.error != null) throw response.error
      return response.value
    }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type -- Supports any function type
  const listeners = new WeakMap<Function, Function>()

  const useAddListener =
    <Id extends string, Args extends unknown[]>(id: Id) =>
    (fn: (...args: Args) => unknown, options?: ListenerOptions) => {
      const listener = listeners.get(fn)
      if (listener != null) {
        // Already added.
        return
      }

      const wrapper = (...[, ...args]: [ev: IpcRendererEvent, ...args: Args]) => {
        fn(...args)
      }

      listeners.set(fn, wrapper)

      if (options?.once === true) ipcRenderer.once(id, wrapper as never)
      else ipcRenderer.on(id, wrapper as never)
    }

  const useRemoveListener =
    <Id extends string, Args extends unknown[]>(id: Id) =>
    (fn: (...args: Args) => unknown) => {
      const listener = listeners.get(fn)
      if (listener == null) {
        // Already removed or never added.
        return
      }

      ipcRenderer.off(id, listener as never)
    }

  return {
    useInvoke,
    useAddListener,
    useRemoveListener
  }
}

export default useIpc
