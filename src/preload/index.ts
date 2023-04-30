// import process from 'node:process'
import { contextBridge, ipcRenderer } from 'electron'
import type { AppInfo, BridgedApi, IpsResponse, UserInfo } from '@preload/api'

const invoke = <Id extends string, Args extends unknown[], Result> (id: Id) =>
  async (...args: Args) => {
    const response = await ipcRenderer.invoke(id, ...args) as IpsResponse<Result>
    if (response.error == null) {
      return response.value
    }

    throw response.error
  }

// Custom APIs for renderer
const api: BridgedApi = {
  startup: {
    checkEnabled: invoke('startup:checkEnabled'),
    enable: invoke('startup:enable'),
    disable: invoke('startup:disable')
  },
  driver: {
    capabilities: Object.freeze({
      kDeviceHasNoExtraCapabilities: 0,
      kDeviceSupportsMultipleOutputs: 1,
      kDeviceCanDecoupleAudioOutput: 2
    }),
    list: invoke('driver:list'),
    open: invoke('driver:open'),
    close: invoke('driver:close'),
    activate: invoke('driver:activate'),
    powerOn: invoke('driver:powerOn'),
    powerOff: invoke('driver:powerOff')
  },
  ports: {
    list: invoke('ports:list')
  },
  system: {
    powerOff: invoke('system:powerOff')
  },
  level: {
    connect: invoke('leveldb:connect'),
    open: invoke('leveldb:open'),
    close: invoke('leveldb:close'),
    get: invoke('leveldb:get'),
    getMany: invoke('leveldb:getMany'),
    put: invoke('leveldb:put'),
    del: invoke('leveldb:del'),
    batch: invoke('leveldb:batch'),
    clear: invoke('leveldb:clear'),
    approximateSize: invoke('leveldb:approximateSize'),
    compactRange: invoke('leveldb:compactRange'),
    iterator: invoke('leveldb:iterator'),
    iteration: {
      next: invoke('leveldb:iterator:next'),
      end: invoke('leveldb:iterator:end'),
      seek: invoke('leveldb:iterator:seek')
    }
  }
}

const appInfo: AppInfo = {
  name: process.env['app_name_'] as string,
  version: process.env['app_version_'] as AppInfo['version']
}

const userInfo: UserInfo = {
  locale: process.env['user_locale_'] as string
}

if (!process.contextIsolated) {
  console.error('Context isolation is not enabled')
  process.exit(1)
}

try {
  // Add the main process APIs.
  contextBridge.exposeInMainWorld('api', api)
  contextBridge.exposeInMainWorld('app', appInfo)
  contextBridge.exposeInMainWorld('user', userInfo)
  // Let's polyfill as must of node as needed for some of our dependencies.
  contextBridge.exposeInMainWorld('setImmediate', setImmediate)
  contextBridge.exposeInMainWorld('clearImmediate', clearImmediate)
  contextBridge.exposeInMainWorld('process', {
    browser: true,
    env: { ...process.env },
    nextTick: setImmediate
  })
} catch (error) {
  console.error(error)
  process.exit(1)
}
