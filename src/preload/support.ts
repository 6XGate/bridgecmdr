import { ipcRenderer } from 'electron'
import { memo } from 'radash'
import type { IpcResponse, ListenerOptions } from './api'
import type { IpcRendererEvent } from 'electron'

export const useIpc = memo(function useIpc() {
  function useInvoke<Id extends string, Args extends unknown[], Result>(id: Id) {
    return async (...args: Args) => {
      const response = (await ipcRenderer.invoke(id, ...args)) as IpcResponse<Result>
      if (response.error != null) throw response.error
      return response.value
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type -- Supports any function type
  const listeners = new WeakMap<Function, Function>()

  function useAddListener<Id extends string, Args extends unknown[]>(id: Id) {
    return (fn: (...args: Args) => unknown, options?: ListenerOptions) => {
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
  }

  function useRemoveListener<Id extends string, Args extends unknown[]>(id: Id) {
    return (fn: (...args: Args) => unknown) => {
      const listener = listeners.get(fn)
      if (listener == null) {
        // Already removed or never added.
        return
      }

      ipcRenderer.off(id, listener as never)
    }
  }

  return {
    useInvoke,
    useAddListener,
    useRemoveListener
  }
})
