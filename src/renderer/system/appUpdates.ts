import { tryOnScopeDispose } from '@vueuse/core'
import useTypedEventTarget from '@/support/events'
import type { ProgressInfo } from 'electron-updater'

export class UpdateProgressEvent extends Event implements ProgressInfo {
  declare readonly type: 'progress'
  declare readonly total: number
  declare readonly delta: number
  declare readonly transferred: number
  declare readonly percent: number
  declare readonly bytesPerSecond: number
  constructor (options: EventInit & ProgressInfo) {
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
    checkForUpdates: window.appUpdates.checkForUpdates,
    downloadUpdate: window.appUpdates.downloadUpdate,
    cancelUpdate: window.appUpdates.cancelUpdate,
    installUpdate: window.appUpdates.installUpdate
  }

  const progressProxy = (info: ProgressInfo) => {
    appUpdater.dispatchEvent(new UpdateProgressEvent(info))
  }

  window.appUpdates.onDownloadProgress(progressProxy)
  tryOnScopeDispose(() => {
    window.appUpdates.offDownloadProgress(progressProxy)
  })

  return appUpdater
}

export default useAppUpdates
