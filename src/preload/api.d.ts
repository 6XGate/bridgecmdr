import type { PortInfo } from '@serialport/bindings-interface'
import type {
  Bytes,
  LevelDownBatchOptions,
  LevelDownClearOptions,
  LevelDownDelOptions,
  LevelDownGetOptions,
  LevelDownIteratorOptions,
  LevelDownOpenOptions,
  LevelDownPutOptions
} from 'leveldown'
import type { Opaque } from 'type-fest'
import type { z } from 'zod'

//
// Internal parts
//

/** Internal IPC response structure */
export interface IpcReturnedValue<T> {
  error?: undefined
  value: T
}

/** Internal IPC error structure */
export interface IpcThrownError {
  error: Error
  value?: undefined
}

/** Internal IPC response structure */
export type IpsResponse<T> = IpcReturnedValue<T> | IpcThrownError

//
// Common parts
//

/** Supported API locales. */
export type ApiLocales = 'en'

/** Opaque handles. */
export type Handle = Opaque<number, 'Handle'>

//
// Login start API
//

/** Login start API. */
export interface StartupApi {
  checkEnabled: () => Promise<boolean>
  enable: () => Promise<void>
  disable: () => Promise<void>
}

//
// Driver API
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
  readonly enable: boolean,
  /** A unique identifier for the driver. */
  readonly guid: string
  /** Defines the localized driver information in all supported locales. */
  readonly localized: {
    /** Defines the localized driver information in a specific locale. */
    readonly [locale in ApiLocales]: LocalizedDriverDescriptor
  }
  /** Defines the capabilities of the device driven by the driver. */
  readonly capabilities: number
}

export type DriverApi = {
  readonly capabilities: {
    readonly kDeviceHasNoExtraCapabilities: 0
    readonly kDeviceSupportsMultipleOutputs: 1
    readonly kDeviceCanDecoupleAudioOutput: 2
  },
  /** Lists registered drivers. */
  readonly list: () => Promise<DriverData[]>
  /** Loads a driver. */
  readonly open: (guid: string, uri: string) => Promise<Handle>
  /** Powers on the switch or monitor. */
  readonly powerOn: (h: Handle) => Promise<void>
  /** Closes the device to which the driver is attached. */
  readonly powerOff: (h: Handle) => Promise<void>
  /**
   * Sets input and output ties.
   *
   * @param inputChannel The input channel to tie.
   * @param videoOutputChannel The output video channel to tie.
   * @param audioOutputChannel The output audio channel to tie.
   */
  readonly activate: (h: Handle, inputChannel: number, videoOutputChannel: number, audioOutputChannel: number) => Promise<void>
  /** Closes the driver, unloading it. */
  readonly close: (h: Handle) => Promise<void>
}

//
// Serial port API
//

export type { PortInfo } from '@serialport/bindings-interface'

/** Exposed serial port APIs. */
export interface PortApi {
  /** Lists available serial ports. */
  readonly list: () => Promise<PortInfo[]>
}

//
// Session control API
//

/** Exposed session control APIs. */
export interface SystemApi {
  /** Powers off the system. */
  readonly powerOff: () => Promise<void>
}

//
// LevelDown proxy API
//

/** Exposed LevelDown proxy API. */
export interface LevelDownApi {
  readonly connect: (name: string) => Promise<Handle>
  readonly open: (h: Handle, options?: LevelDownOpenOptions) => Promise<void>
  readonly close: (h: Handle) => Promise<void>
  readonly get: (h: Handle, key: Bytes, options?: LevelDownGetOptions) => Promise<[Bytes]>
  readonly getMany: (h: Handle, key: Bytes[], options: AbstractGetOptions) => Promise<[Bytes[]]>
  readonly put: (h: Handle, key: Bytes, value: Bytes, options?: LevelDownPutOptions) => Promise<void>
  readonly del: (h: Handle, key: Bytes, options?: LevelDownDelOptions) => Promise<void>
  readonly batch: (h: Handle, array: Array<AbstractBatch<Bytes, Bytes>>, options?: LevelDownBatchOptions) => Promise<void>
  readonly clear: (h: Handle, options?: LevelDownClearOptions) => Promise<void>
  readonly approximateSize: (h: Handle, start: Bytes, end: Bytes) => Promise<[number]>
  readonly compactRange: (h: Handle, start: Bytes, end: Bytes) => Promise<void>
  readonly iterator(h: Handle, options?: LevelDownIteratorOptions): Promise<Handle>
  readonly iteration: {
    readonly next: (h: Handle) => Promise<[key: Bytes, value: Bytes]>
    readonly end: (h: Handle) => Promise<void>
    readonly seek: (h: Handle, key: Bytes) => Promise<void>
  }
}

//
// Exposed APIs
//

/** Functional APIs */
export interface BridgedApi {
  readonly startup: StartupApi
  readonly driver: DriverApi
  readonly ports: PortApi
  readonly system: SystemApi
  readonly level: LevelDownApi
}

/** Basic application information. */
export interface AppInfo {
  readonly name: string,
  readonly version: `${number}.${number}.${number}`
}

/** Basic user information. */
export interface UserInfo {
  // TODO: User name
  readonly locale: string
}

// The exposed API global structure
declare global {
  interface Window {
    api: BridgedApi
    app: AppInfo
    user: UserInfo
  }
}
