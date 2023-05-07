import { ipcMain } from 'electron'
import { memo } from 'radash'
import { ipcProxy } from '@main/utilities'
import useHandles from './handle'
import type { HandleKey } from './handle'
import type { DriverApi, DriverData, Handle } from '@preload/api'

//
// Device capabilities
//

/** The device has no extended capabilities. */
export const kDeviceHasNoExtraCapabilities = 0
/** The device has multiple output channels. */
export const kDeviceSupportsMultipleOutputs = 1
/** The device support sending the audio output to a different channel. */
export const kDeviceCanDecoupleAudioOutput = 2

//
// Driver definition
//

/** Interacts with a device. */
export interface DriverBindings {
  /**
   * Activates input and output ties.
   *
   * @param inputChannel The input channel to tie.
   * @param videoOutputChannel The output video channel to tie.
   * @param audioOutputChannel The output audio channel to tie.
   */
  readonly activate: (inputChannel: number, videoOutputChannel: number, audioOutputChannel: number) => Promise<void>

  /** Powers on the switch or monitor. */
  readonly powerOn?: () => Promise<void>

  /** Powers off the switch or monitor. */
  readonly powerOff?: () => Promise<void>

  /** Closes the driver to free any used resources. */
  readonly close?: () => Promise<void>
}

/** Driver to interact with switching devices. */
export interface Driver extends DriverBindings {
  /** The URI to the device being driven. */
  readonly uri: string
}

/** Provides the basic information to create a driver factory registration. */
export interface DriverFactory {
  /** Provides information about the driver. */
  readonly data: DriverData
  /** Loads a driver. */
  readonly load: (uri: string) => Promise<Driver>
}

/**
 * Initializes a driver.
 *
 * @param uri A uri to the device.
 */
export type DriverSetup = (uri: string) => Promise<DriverBindings>

export interface DriverOptions extends DriverData {
  setup: DriverSetup
}

/** Defines a driver. */
export function defineDriver (options: DriverOptions): DriverFactory | undefined {
  const { setup, ...data } = options
  if (!data.enable) {
    return undefined
  }

  return Object.freeze({
    data,
    load: async (uri: string): Promise<Driver> => Object.freeze({
      ...(await setup(uri)),
      uri
    })
  })
}

//
// Driver API back-end
//

interface DriverBackEnd extends DriverApi {
  register: (factory: DriverFactory | undefined) => void
}

const useDrivers = memo(() => {
  const { createHandle, openHandle, freeHandle } = useHandles()
  const kDriverHandle = Symbol.for('@driver') as HandleKey<Driver>

  /** The driver registry. */
  const registry = new Map<string, DriverFactory>()

  /** Registers a driver. */
  function register (factory: DriverFactory | undefined) {
    if (factory != null) {
      registry.set(factory.data.guid, factory)
    }
  }

  async function list () {
    return await Promise.resolve(Array.from(registry.values()).map(d => d.data))
  }

  /** Loads a driver registered in the registry. */
  async function open (guid: string, path: string) {
    const factory = registry.get(guid)
    if (factory == null) {
      throw new Error(`No such driver registered as "${guid}"`)
    }

    return createHandle(kDriverHandle, await factory.load(path),
      async driver => { await driver.close?.() })
  }

  async function close (h: Handle) {
    await freeHandle(h)
  }

  async function powerOn (h: Handle) {
    await openHandle(kDriverHandle, h).powerOn?.()
  }

  async function powerOff (h: Handle) {
    await openHandle(kDriverHandle, h).powerOff?.()
  }

  async function activate (h: Handle, inputChannel: number, videoOutputChannel: number, audioOutputChannel: number) {
    await openHandle(kDriverHandle, h).activate(inputChannel, videoOutputChannel, audioOutputChannel)
  }

  ipcMain.handle('driver:list', ipcProxy(list))
  ipcMain.handle('driver:open', ipcProxy(open))
  ipcMain.handle('driver:close', ipcProxy(close))
  ipcMain.handle('driver:powerOn', ipcProxy(powerOn))
  ipcMain.handle('driver:powerOff', ipcProxy(powerOff))
  ipcMain.handle('driver:activate', ipcProxy(activate))

  return {
    capabilities: {
      kDeviceHasNoExtraCapabilities,
      kDeviceSupportsMultipleOutputs,
      kDeviceCanDecoupleAudioOutput
    },
    register,
    list,
    open,
    close,
    powerOn,
    powerOff,
    activate
  } satisfies DriverBackEnd
})

export default useDrivers
