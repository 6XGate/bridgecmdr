import EventEmitter from 'node:events'
import { writeFile } from 'node:fs/promises'
import { resolve as resolvePath } from 'node:path'
import autoBind from 'auto-bind'
import { app } from 'electron'
import { autoUpdater } from 'electron-updater'
import { memo } from 'radash'
import { logError } from '../utilities'
import type { UpdateCheckResult, ProgressInfo, CancellationToken, UpdateInfo } from 'electron-updater'
import { isNodeError } from '@/error-handling'

export type { UpdateInfo, ProgressInfo } from 'electron-updater'

export interface AppUpdaterEventMap {
  checking: []
  available: [info: UpdateInfo | null]
  progress: [progress: ProgressInfo]
  downloaded: [info: UpdateInfo]
  cancelled: []
}

export type AppUpdater = ReturnType<typeof useUpdater>

const useUpdater = memo(function useUpdater() {
  /** The internal application updater for AppImage. */
  autoUpdater.autoDownload = false
  autoUpdater.autoInstallOnAppQuit = false
  autoUpdater.forceDevUpdateConfig = true
  // FIXME: Find some way to prevent if from logging
  // errors that are caught and handled.
  // autoUpdater.logger = Logger

  /**
   * Application auto update.
   *
   * We are using a class for EventEmitter's sake.
   */
  class AppUpdater extends EventEmitter<AppUpdaterEventMap> {
    #checkPromise: Promise<UpdateCheckResult | null> | undefined = undefined
    #cancelToken: CancellationToken | undefined = undefined
    #donwloadPromise: Promise<string[]> | undefined = undefined

    constructor() {
      super()
      autoUpdater.on('checking-for-update', () => {
        this.emit('checking')
      })
      autoUpdater.on('update-available', (info) => {
        this.emit('available', info)
      })
      autoUpdater.on('update-not-available', () => {
        this.emit('available', null)
      })
      autoUpdater.on('update-downloaded', (info) => {
        this.emit('downloaded', info)
      })
      autoUpdater.on('update-cancelled', () => {
        this.emit('cancelled')
      })
    }

    private async getUpdateInfo() {
      if (this.#checkPromise == null) {
        throw logError(new ReferenceError('Cannot get update information, no check in progress'))
      }

      let result
      try {
        result = await this.#checkPromise
      } catch (cause) {
        if (isNodeError(cause) && cause.code === 'ENOENT') {
          return null
        }

        throw cause
      }

      // If the result is null or the cancel token is null, no update is avilable.
      if (result?.cancellationToken == null) {
        return null
      }

      this.#cancelToken = result.cancellationToken

      return result.updateInfo
    }

    private async attemptCheckForUpdates() {
      if (this.#donwloadPromise != null) {
        throw logError(new ReferenceError('Update download already in progress'))
      }

      try {
        if (import.meta.env.DEV) {
          // Force update check on for testing.
          const installPath = resolvePath(app.getAppPath(), 'dist', 'BridgeCmdr')
          await writeFile(installPath, '')
          process.env['APPIMAGE'] = installPath
        }

        this.#checkPromise = autoUpdater.checkForUpdates()

        return await this.getUpdateInfo()
      } finally {
        this.#checkPromise = undefined
      }
    }

    async checkForUpdates() {
      if (this.#checkPromise != null) {
        return await this.getUpdateInfo()
      }

      return await this.attemptCheckForUpdates()
    }

    private async attemptDownloadUpdate() {
      if (this.#cancelToken == null) {
        throw logError(new ReferenceError('No update available for download, check first'))
      }

      const handleProgress = (progress: ProgressInfo) => {
        this.emit('progress', progress)
      }
      try {
        autoUpdater.on('download-progress', handleProgress)
        this.#donwloadPromise = autoUpdater.downloadUpdate(this.#cancelToken)
        await this.#donwloadPromise
      } finally {
        autoUpdater.off('download-progress', handleProgress)
        this.#cancelToken = undefined
      }
    }

    async downloadUpdate() {
      if (this.#donwloadPromise != null) {
        await this.#donwloadPromise
      } else {
        await this.attemptDownloadUpdate()
      }
    }

    async cancelUpdate() {
      if (this.#cancelToken == null || this.#cancelToken.cancelled) {
        return
      }

      this.#cancelToken.cancel()

      await Promise.resolve()
    }

    async installUpdate() {
      autoUpdater.quitAndInstall()

      await Promise.resolve()
    }
  }

  return autoBind(new AppUpdater())
})

export default useUpdater
