import { memo } from 'radash'
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
export const defineDriver = (options: DriverOptions): DriverFactory | undefined => {
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

const kDriverHandle = Symbol.for('@driver') as HandleKey<Driver>

export const useDrivers = memo(() => {
  const { createHandle, openHandle, freeHandle } = useHandles()

  /** The driver registry. */
  const registry = new Map<string, DriverFactory>()

  /** Registers a driver. */
  const register = (factory: DriverFactory | undefined) => {
    if (factory != null) {
      registry.set(factory.data.guid, factory)
    }
  }

  const list = async () => await Promise.resolve(
    Array.from(registry.values()).map(d => d.data)
  )

  /** Loads a driver registered in the registry. */
  const open = async (guid: string, path: string) => {
    const factory = registry.get(guid)
    if (factory == null) {
      throw new Error(`No such driver registered as "${guid}"`)
    }

    return createHandle(kDriverHandle, await factory.load(path),
      async driver => { await driver.close?.() })
  }

  const close = async (h: Handle) => {
    await freeHandle(h)
  }

  const powerOn = async (h: Handle) => {
    await openHandle(kDriverHandle, h).powerOn?.()
  }

  const powerOff = async (h: Handle) => {
    await openHandle(kDriverHandle, h).powerOff?.()
  }

  const activate = async (h: Handle, inputChannel: number, videoOutputChannel: number, audioOutputChannel: number) => {
    await openHandle(kDriverHandle, h).activate(inputChannel, videoOutputChannel, audioOutputChannel)
  }

  return {
    capabilities: Object.freeze({
      kDeviceHasNoExtraCapabilities,
      kDeviceSupportsMultipleOutputs,
      kDeviceCanDecoupleAudioOutput
    }),
    register,
    list,
    open,
    close,
    powerOn,
    powerOff,
    activate
  } satisfies DriverApi & Record<string, unknown>
})
