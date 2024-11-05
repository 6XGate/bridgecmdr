import type { AppConfig } from '../main/info/config'

//
// Exposed via tRPC
//

export type { AppInfo } from '../main/info/app'
export type { UserInfo } from '../main/info/user'

export type { AppRouter } from '../main/routes/router'
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
