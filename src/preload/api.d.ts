import type { AbstractBatch, AbstractGetOptions } from 'abstract-leveldown'
import type { IpcRendererEvent } from 'electron'
import type { ProgressInfo, UpdateInfo } from 'electron-updater'
import type {
  LevelDownBatchOptions,
  LevelDownClearOptions,
  LevelDownDelOptions,
  LevelDownGetOptions,
  LevelDownIteratorOptions,
  LevelDownOpenOptions,
  LevelDownPutOptions
} from 'leveldown'
import type { SerialPort } from 'serialport'
import type { IterableElement, Tagged } from 'type-fest'

//
// Internal parts
//

/** Defines an event handler callback for a specific type of event. */
type EventHandlerCallback<E extends Event> = (ev: E) => unknown
/** Defines an event handler object for a specific type of event. */
interface EventHandlerObject<E extends Event> {
  handleEvent: EventHandlerCallback<E>
}

/** Defines an event handler for a specific type of event. */
type EventHandler<E extends Event> = EventHandlerCallback<E> | EventHandlerObject<E>

/** Defines an event target for a specific type of event. */
interface EventTargetEx<E extends Event> extends EventTarget {
  addEventListener(type: E['type'], callback: EventHandler<E> | null): void
  addEventListener(type: E['type'], callback: EventHandler<E> | null, useCapture: boolean): void
  addEventListener(type: E['type'], callback: EventHandler<E> | null, options: EventListenerOptions): void
  removeEventListener(type: E['type'], callback: EventHandler<E> | null): void
  removeEventListener(type: E['type'], callback: EventHandler<E> | null, useCapture: boolean): void
  removeEventListener(type: E['type'], callback: EventHandler<E> | null, options: EventListenerOptions): void
  dispatchEvent(event: E): boolean
}

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
export type IpcResponse<T> = IpcReturnedValue<T> | IpcThrownError

//
// Common parts
//

/** Supported API locales. */
export type ApiLocales = 'en'

/** Opaque handles. */
export type Handle = Tagged<number, 'Handle'>

/** Event listener attachment options */
export interface ListenerOptions {
  once?: boolean | undefined
}

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
  readonly enable: boolean
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

export interface DriverApi {
  readonly capabilities: {
    readonly kDeviceHasNoExtraCapabilities: 0
    readonly kDeviceSupportsMultipleOutputs: 1
    readonly kDeviceCanDecoupleAudioOutput: 2
  }
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
  readonly activate: (
    h: Handle,
    inputChannel: number,
    videoOutputChannel: number,
    audioOutputChannel: number
  ) => Promise<void>
}

//
// Serial port API
//

// type PortInfo = IterableElement<Awaited<ReturnType<typeof SerialPort.list>>>
// HACK: Workaround legacy TypeDefinition from serialport PortInfo.
interface PortInfo {
  path: string
  manufacturer: string | undefined
  serialNumber: string | undefined
  pnpId: string | undefined
  locationId: string | undefined
  productId: string | undefined
  vendorId: string | undefined
}

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
  readonly powerOff: (interactive?: boolean) => Promise<void>
}

//
// LevelDown proxy API
//

export type LevelKey = string | Buffer
export type LevelValue = string | Buffer

// /** Exposed LevelDown proxy API. */
// export interface LevelProxyApi {
//   readonly connect: (name: string) => Promise<Handle>
//   readonly open: (h: Handle, options?: LevelDownOpenOptions) => Promise<void>
//   readonly close: (h: Handle) => Promise<void>
//   readonly get: (h: Handle, key: LevelKey, options?: LevelDownGetOptions) => Promise<[Bytes]>
//   readonly getMany: (h: Handle, keys: LevelKey[], options?: AbstractGetOptions) => Promise<[Bytes[]]>
//   readonly put: (h: Handle, key: LevelKey, value: Bytes, options?: LevelDownPutOptions) => Promise<void>
//   readonly del: (h: Handle, key: LevelKey, options?: LevelDownDelOptions) => Promise<void>
//   readonly batch: (h: Handle, array: AbstractBatch[], options?: LevelDownBatchOptions) => Promise<void>
//   readonly clear: (h: Handle, options?: LevelDownClearOptions) => Promise<void>
//   readonly approximateSize: (h: Handle, start: Bytes, end: Bytes) => Promise<[number]>
//   readonly compactRange: (h: Handle, start: Bytes, end: Bytes) => Promise<void>
//   readonly iterator: (h: Handle, options?: LevelDownIteratorOptions) => Promise<Handle>
//   readonly iteration: {
//     readonly next: (h: Handle) => Promise<[key: Bytes, value: Bytes]>
//     readonly end: (h: Handle) => Promise<void>
//     readonly seek: (h: Handle, key: Bytes) => Promise<void>
//   }
// }

export type Messanger = (message: unknown) => void

/** Level RPC API. */
export interface LevelApi {
  readonly open: (name: string) => Promise<Handle>
  readonly activate: (h: Handle, receiver: Messanger) => Promise<Messanger>
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
  readonly level: LevelApi
  /** Closes a handle, freeing its resources. */
  readonly freeHandle: (h: Handle) => Promise<void>
  /** Closes all handles for a page. */
  readonly freeAllHandles: () => Promise<void>
}

/** Basic application information. */
export interface AppInfo {
  readonly name: string
  readonly version: `${number}.${number}.${number}`
}

/** Basic user information. */
export interface UserInfo {
  readonly name: string
  readonly locale: string
}

export interface AppUpdater {
  checkForUpdates: () => Promise<UpdateInfo | undefined>
  downloadUpdate: () => Promise<void>
  cancelUpdate: () => Promise<void>
  installUpdate: () => Promise<void>
}

export interface AppUpdates extends AppUpdater {
  onDownloadProgress: (fn: (progress: ProgressInfo) => void) => void
  offDownloadProgress: (fn: (progress: ProgressInfo) => void) => void
}

// The exposed API global structure
declare global {
  // APIs
  var api: BridgedApi
  var app: AppInfo
  var user: UserInfo
  // Events
  var appUpdates: AppUpdates
}