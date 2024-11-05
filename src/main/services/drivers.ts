//
// Device capabilities
//

import { memo } from 'radash'
import useSerialPorts from './ports'
import type { ApiLocales } from './locale'
import type { MaybePromise } from '@/basics'
import { isIpOrValidPort } from '@/location'

/** The device has no extended capabilities. */
export type kDeviceHasNoExtraCapabilities = typeof kDeviceHasNoExtraCapabilities
export const kDeviceHasNoExtraCapabilities = 0
/** The device has multiple output channels. */
export type kDeviceSupportsMultipleOutputs = typeof kDeviceSupportsMultipleOutputs
export const kDeviceSupportsMultipleOutputs = 1
/** The device support sending the audio output to a different channel. */
export type kDeviceCanDecoupleAudioOutput = typeof kDeviceCanDecoupleAudioOutput
export const kDeviceCanDecoupleAudioOutput = 2

export type DriverKind = 'monitor' | 'switch'

//
// Driver definition
//

export interface DriverBasicInformation {
  /**
   * Indicates whether the driver is enabled, this is to allow partially coded drivers to be
   * commited, but not usable to the UI or other code.
   */
  readonly enabled: boolean
  /** Indicates whether the driver is experimental, usually due to lack of testing. */
  readonly experimental: boolean
  /** Identifies the kind of device driven by the driver. */
  readonly kind: DriverKind
  /** A unique identifier for the driver. */
  readonly guid: string
  /** Defines the capabilities of the device driven by the driver. */
  readonly capabilities: number
}

/** Defines the localized metadata about a driver. */
export interface LocalizedDriverInformation {
  /** Defines the title for the driver in a specific locale. */
  readonly title: string
  /** Defines the company for the driver in a specific locale. */
  readonly company: string
  /** Defines the provider for the driver in a specific locale. */
  readonly provider: string
}

/** Defines basic metadata about a device and driver. */
export interface DriverInformation extends DriverBasicInformation {
  /** Defines the localized driver information in all supported locales. */
  readonly localized: Readonly<Record<ApiLocales, LocalizedDriverInformation>>
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

export interface DefineDriverOptions extends DriverInformation {
  setup: () => DriverBindings
}

async function noOpBinding() {
  /* no-op is not defined in setup */ await Promise.resolve()
}

const registry = new Map<string, Driver>()

export interface Driver extends DriverBasicInformation, Required<DriverBindings> {
  /** Raw metadata from the registration options. */
  readonly metadata: DriverInformation
  /** Gets the localized driver information. */
  getInfo: (locale: ApiLocales) => LocalizedDriverInformation
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
      experimental: info.experimental,
      kind: info.kind,
      guid: info.guid,
      ...localizedInfo,
      capabilities: info.capabilities
    }
  })

  existing = Object.freeze({
    // Optional bindings will be no-op.
    powerOn: noOpBinding,
    powerOff: noOpBinding,
    // Provided bindings.
    ...implemented,
    // Information and informational functionality.
    enabled: info.enabled,
    experimental: info.experimental,
    kind: info.kind,
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
  const ports = useSerialPorts()

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

  const all = defineOperation(() => Array.from(registry.values()).filter((driver) => driver.enabled))

  const get = defineOperation((guid: string) => registry.get(guid) ?? null)

  function defineDriverOperation<Args extends unknown[], Result>(
    op: (driver: Driver, uri: string, ...args: Args) => MaybePromise<Result>
  ) {
    return async (guid: string, uri: string, ...args: Args) => {
      const driver = await get(guid)
      if (driver == null) throw new ReferenceError(`No such driver: "${guid}"`)
      const valid = await ports.listPorts()
      if (!isIpOrValidPort(uri, valid)) throw new TypeError(`"${uri}" is not a valid location`)
      return await op(driver, uri, ...args)
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
