import { contextBridge } from 'electron'

const usePolyfills = () => {
  contextBridge.exposeInMainWorld('setImmediate', setImmediate)
  contextBridge.exposeInMainWorld('clearImmediate', clearImmediate)
  contextBridge.exposeInMainWorld('process', {
    browser: true,
    env: { ...process.env },
    nextTick: setImmediate
  })
}

export default usePolyfills
