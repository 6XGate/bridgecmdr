//
// Device capabilities
//

import { memo } from 'radash'
import type { ApiLocales } from './locale'
import type { MaybePromise } from '@/basics'

/** The device has no extended capabilities. */
export type kDeviceHasNoExtraCapabilities = typeof kDeviceHasNoExtraCapabilities
export const kDeviceHasNoExtraCapabilities = 0
/** The device has multiple output channels. */
export type kDeviceSupportsMultipleOutputs = typeof kDeviceSupportsMultipleOutputs
export const kDeviceSupportsMultipleOutputs = 1
/** The device support sending the audio output to a different channel. */
export type kDeviceCanDecoupleAudioOutput = typeof kDeviceCanDecoupleAudioOutput
export const kDeviceCanDecoupleAudioOutput = 2

//
// Driver definition
//

/** Defines the localized metadata about a driver. */
export interface LocalizedDriverDescriptor {
  /** Defines the title for the driver in a specific locale. */
  readonly title: string
  /** Defines the company for the driver in a specific locale. */
  readonly company: string
  /** Defines the provider for the driver in a specific locale. */
  readonly provider: string
}

/** Defines basic metadata about a device and driver. */
export interface DriverData {
  /**
   * Indicates whether the driver is enabled, this is to allow partially coded drivers to be
   * commited, but not usable to the UI or other code.
   */
  readonly enabled: boolean
  /** A unique identifier for the driver. */
  readonly guid: string
  /** Defines the localized driver information in all supported locales. */
  readonly localized: Readonly<Record<ApiLocales, LocalizedDriverDescriptor>>
  /** Defines the capabilities of the device driven by the driver. */
  readonly capabilities: number
}

/** Interacts with a device. */
export interface DriverBindings {
  /**
   * Activates input and output ties.
   *
   * @param uri - URI identifying the location of the device.
   * @param inputChannel - The input channel to tie.
   * @param videoOutputChannel - The output video channel to tie.
   * @param audioOutputChannel - The output audio channel to tie.
   */
  readonly activate: (
    uri: string,
    inputChannel: number,
    videoOutputChannel: number,
    audioOutputChannel: number
  ) => Promise<void>

  /**
   * Powers on the switch or monitor.
   *
   * @param uri - URI identifying the location of the device.
   */
  readonly powerOn?: (uri: string) => Promise<void>

  /**
   * Powers off the switch or monitor.
   *
   * @param uri - URI identifying the location of the device.
   */
  readonly powerOff?: (uri: string) => Promise<void>
}

export interface DefineDriverOptions extends DriverData {
  setup: () => DriverBindings
}

async function noOpPower() {
  /* no-op is not defined in setup */ await Promise.resolve()
}

const registry = new Map<string, Driver>()

export interface Driver {
  /**
   * Indicates whether the driver is enabled, this is to allow partially coded drivers to be
   * commited, but not usable to the UI or other code.
   */
  readonly enabled: boolean
  /** A unique identifier for the driver. */
  readonly guid: string
  /** Defines the capabilities of the device driven by the driver. */
  readonly capabilities: number
  /** Raw metadata from the registration options. */
  readonly metadata: DriverData
  /** Gets the localized driver information. */
  getInfo: (locale: ApiLocales) => LocalizedDriverDescriptor
  /**
   * Activates input and output ties.
   *
   * @param uri - URI identifying the location of the device.
   * @param inputChannel - The input channel to tie.
   * @param videoOutputChannel - The output video channel to tie.
   * @param audioOutputChannel - The output audio channel to tie.
   */
  readonly activate: (
    uri: string,
    inputChannel: number,
    videoOutputChannel: number,
    audioOutputChannel: number
  ) => Promise<void>

  /**
   * Powers on the switch or monitor.
   *
   * @param uri - URI identifying the location of the device.
   */
  readonly powerOn: (uri: string) => Promise<void>

  /**
   * Powers off the switch or monitor.
   *
   * @param uri - URI identifying the location of the device.
   */
  readonly powerOff: (uri: string) => Promise<void>
}

export function defineDriver(options: DefineDriverOptions) {
  let existing = registry.get(options.guid)
  if (existing != null) return existing

  const { setup, ...info } = options
  const implemented = setup()

  const getInfo = memo(function getInfo(locale: ApiLocales) {
    const localizedInfo = info.localized[locale]

    return {
      enabled: info.enabled,
      guid: info.guid,
      ...localizedInfo,
      capabilities: info.capabilities
    }
  })

  existing = Object.freeze({
    powerOn: noOpPower,
    powerOff: noOpPower,
    ...implemented,
    enabled: info.enabled,
    guid: info.guid,
    capabilities: info.capabilities,
    metadata: info,
    getInfo
  })

  registry.set(options.guid, existing)
  return existing
}

const useDrivers = memo(function useDriver() {
  const drivers = import.meta.glob('../drivers/**/*')
  const booted = Promise.all(
    Object.values(drivers).map(async (factory) => {
      await factory()
    })
  )

  function defineOperation<Args extends unknown[], Result>(op: (...args: Args) => MaybePromise<Result>) {
    return async (...args: Args) => {
      await booted
      return await op(...args)
    }
  }

  const all = defineOperation(() => Array.from(registry.values()))

  const get = defineOperation((guid: string) => registry.get(guid) ?? null)

  function defineDriverOperation<Args extends unknown[], Result>(
    op: (driver: Driver, ...args: Args) => MaybePromise<Result>
  ) {
    return async (guid: string, ...args: Args) => {
      const driver = await get(guid)
      if (driver == null) throw new ReferenceError(`No such driver: "${guid}"`)
      return await op(driver, ...args)
    }
  }

  const activate = defineDriverOperation(
    async (driver, uri: string, input: number, videoOutput: number, audioOutput: number) => {
      await driver.activate(uri, input, videoOutput, audioOutput)
    }
  )

  const powerOn = defineDriverOperation(async (driver, uri: string) => {
    await driver.powerOn(uri)
  })

  const powerOff = defineDriverOperation(async (driver, uri: string) => {
    await driver.powerOff(uri)
  })

  return {
    all,
    get,
    activate,
    powerOn,
    powerOff
  }
})

export default useDrivers
