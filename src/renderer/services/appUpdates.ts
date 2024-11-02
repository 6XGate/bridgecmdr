import { createSharedComposable, tryOnScopeDispose } from '@vueuse/core'
import useTypedEventTarget from '../support/events'
import { useClient } from './rpc'
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

const useAppUpdates = createSharedComposable(function useAppUpdates() {
  const client = useClient()

  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Inapropriate, type !== interface
  type Events = {
    progress: (ev: UpdateProgressEvent) => void
  }

  const target = useTypedEventTarget<Events>()

  const appUpdater = {
    ...target,
    checkForUpdates: async () => await client.updates.checkForUpdates.query(),
    downloadUpdate: async () => {
      await client.updates.downloadUpdate.query()
    },
    cancelUpdate: async () => {
      await client.updates.cancelUpdate.query()
    },
    installUpdate: async () => {
      await client.updates.installUpdate.query()
    }
  }

  function progressProxy(info: ProgressInfo) {
    appUpdater.dispatchEvent(new UpdateProgressEvent(info))
  }

  const checking = client.updates.onChecking.subscribe(undefined, {
    onData() {
      console.log('Checking for updates...')
    }
  })

  const available = client.updates.onAvailable.subscribe(undefined, {
    onData([info]) {
      if (info != null) console.log(`Update available to ${info.version}`)
      else console.log('No updates available.')
    }
  })

  const progres = client.updates.onProgress.subscribe(undefined, {
    onData([info]) {
      progressProxy(info)
    }
  })

  tryOnScopeDispose(() => {
    checking.unsubscribe()
    available.unsubscribe()
    progres.unsubscribe()
  })

  return appUpdater
})

export default useAppUpdates
