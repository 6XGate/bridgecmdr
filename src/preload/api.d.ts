import type { AppConfig } from '../main/info/config'
import type { RpcInterface } from './index'

//
// Exposed via tRPC
//

export type { AppRouter } from '../main/routes/router'
export type { AppInfo } from '../main/services/app'
export type { UserInfo } from '../main/services/user'
export type { DocumentId } from '../main/services/database'
export type { ApiLocales } from '../main/services/locale'
export type { PortEntry } from '../main/services/ports'
export type { UpdateInfo, ProgressInfo } from '../main/services/updater'

export type { Source, NewSource, SourceUpdate } from '../main/dao/sources'
export type { Switch, NewSwitch, SwitchUpdate } from '../main/dao/switches'
export type { Tie, NewTie, TieUpdate } from '../main/dao/ties'
export type { ApiLocales } from '../main/locale'

export type {
  DriverKind,
  DriverBindings,
  DriverInformation,
  DriverBasicInformation,
  LocalizedDriverInformation,
  // Cannot be exported as values, but they are literals.
  kDeviceCanDecoupleAudioOutput,
  kDeviceHasNoExtraCapabilities,
  kDeviceSupportsMultipleOutputs
} from '../main/services/drivers'

declare global {
  var rpc: RpcInterface
}
