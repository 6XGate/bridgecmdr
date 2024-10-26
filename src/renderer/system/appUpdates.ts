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

function useAppUpdates() {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Inapropriate, type !== interface
  type Events = {
    progress: (ev: UpdateProgressEvent) => void
  }

  const target = useTypedEventTarget<Events>()

  const appUpdater = {
    ...target,
    checkForUpdates: globalThis.services.updates.checkForUpdates,
    downloadUpdate: globalThis.services.updates.downloadUpdate,
    cancelUpdate: globalThis.services.updates.cancelUpdate,
    installUpdate: globalThis.services.updates.installUpdate
  }

  function progressProxy(info: ProgressInfo) {
    appUpdater.dispatchEvent(new UpdateProgressEvent(info))
  }

  globalThis.services.updates.onDownloadProgress(progressProxy)
  tryOnScopeDispose(() => {
    globalThis.services.updates.offDownloadProgress(progressProxy)
  })

  return appUpdater
}

export default useAppUpdates
