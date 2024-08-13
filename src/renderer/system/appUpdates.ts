import { tryOnScopeDispose } from '@vueuse/core'
import useTypedEventTarget from '../support/events'
import type { ProgressInfo } from 'electron-updater'

export class UpdateProgressEvent extends Event implements ProgressInfo {
  declare readonly type: 'progress'
  declare readonly total: number
  declare readonly delta: number
  declare readonly transferred: number
  declare readonly percent: number
  declare readonly bytesPerSecond: number
  constructor(options: EventInit & ProgressInfo) {
    super('progress', options)
    Object.assign(this, options)
  }
}

const useAppUpdates = () => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Inapropriate, type !== interface
  type Events = {
    progress: (ev: UpdateProgressEvent) => void
  }

  const target = useTypedEventTarget<Events>()

  const appUpdater = {
    ...target,
    checkForUpdates: globalThis.appUpdates.checkForUpdates,
    downloadUpdate: globalThis.appUpdates.downloadUpdate,
    cancelUpdate: globalThis.appUpdates.cancelUpdate,
    installUpdate: globalThis.appUpdates.installUpdate
  }

  const progressProxy = (info: ProgressInfo) => {
    appUpdater.dispatchEvent(new UpdateProgressEvent(info))
  }

  globalThis.appUpdates.onDownloadProgress(progressProxy)
  tryOnScopeDispose(() => {
    globalThis.appUpdates.offDownloadProgress(progressProxy)
  })

  return appUpdater
}

export default useAppUpdates
