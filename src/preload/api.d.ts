import type { Dialog, IpcRendererEvent, OpenDialogOptions, SaveDialogOptions } from 'electron'
import type { ProgressInfo, UpdateInfo } from 'electron-updater'
import type { ArrayTail, ReadonlyDeep, Tagged } from 'type-fest'
import type { AppConfig } from '../main/info/config'

//
// Exposed from main
//

export type { AppInfo } from '../main/info/app'
export type { UserInfo } from '../main/info/user'
export type { AppConfig } from '../main/info/config'
export type { AppRouter } from '../main/routes/router'
export type { DocumentId } from '../main/services/database'
export type { ApiLocales } from '../main/services/locale'
export type { UserStore } from '../main/dao/storage'
export type { PortEntry } from '../main/services/ports'
export type { Source, NewSource, SourceUpdate } from '../main/dao/sources'
export type { Switch, NewSwitch, SwitchUpdate } from '../main/dao/switches'
export type { Tie, NewTie, TieUpdate } from '../main/dao/ties'
export type { ApiLocales } from '../main/locale'

export type {
  Driver,
  DriverData,
  LocalizedDriverDescriptor,
  // Cannot be exported as values, but they are literals.
  kDeviceCanDecoupleAudioOutput,
  kDeviceHasNoExtraCapabilities,
  kDeviceSupportsMultipleOutputs
} from '../main/services/drivers'

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
export type IpcResponse<T> = IpcReturnedValue<T> | IpcThrownError

//
// Common parts
//

/** Event listener attachment options */
export interface ListenerOptions {
  once?: boolean | undefined
}

//
// Session control API
//

/** Exposed session control APIs. */
export interface SystemApi {
  /** Powers off the system. */
  readonly powerOff: (interactive?: boolean) => Promise<void>
  /** Shows the open file dialog. */
  readonly openFile: (options: OpenDialogOptions) => Promise<File[] | null>
  /** Shows the save file dialog to save a file. */
  readonly saveFile: (file: File, options: SaveDialogOptions) => Promise<boolean>
}

//
// Process data
//

type ProcessType = 'browser' | 'renderer' | 'worker' | 'utility'

export interface ProcessData {
  readonly appleStore: true | undefined
  readonly arch: NodeJS.Architecture
  readonly argv: readonly string[]
  readonly argv0: string
  readonly env: ReadonlyDeep<Record<string, string | undefined>>
  readonly execPath: string
  readonly platform: NodeJS.Platform
  readonly resourcesPath: string
  readonly sandboxed: true | undefined
  readonly type: ProcessType
  readonly version: string
  readonly versions: NodeJS.ProcessVersions
  readonly windowsStore: true | undefined
}
//
// Exposed APIs
//

/** Functional APIs */
export interface MainProcessServices {
  readonly process: ProcessData
  readonly system: SystemApi
  readonly updates: AppUpdates
}

export interface AppUpdater {
  readonly checkForUpdates: () => Promise<UpdateInfo | undefined>
  readonly downloadUpdate: () => Promise<void>
  readonly cancelUpdate: () => Promise<void>
  readonly installUpdate: () => Promise<void>
}

export interface AppUpdates extends AppUpdater {
  readonly onDownloadProgress: (fn: (progress: ProgressInfo) => void) => void
  readonly offDownloadProgress: (fn: (progress: ProgressInfo) => void) => void
}

// The exposed API global structure
declare global {
  var services: MainProcessServices
  var configuration: AppConfig
}
