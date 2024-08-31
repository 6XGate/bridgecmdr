import EventEmitter from 'node:events'
import { writeFile } from 'node:fs/promises'
import { resolve as resolvePath } from 'node:path'
import autoBind from 'auto-bind'
import { app, ipcMain } from 'electron'
import { autoUpdater } from 'electron-updater'
import { memo } from 'radash'
import { ipcHandle, ipcProxy, isNodeError, logError } from '../utilities'
import type { AppUpdater } from '../../preload/api'
import type { WebContents } from 'electron'
import type { UpdateCheckResult, ProgressInfo, CancellationToken } from 'electron-updater'

interface AppAutoUpdaterEventMap {
  progress: [progress: ProgressInfo]
}

type ProgressHandler = (...args: AppAutoUpdaterEventMap['progress']) => void

const useUpdater = memo(() => {
  /** The internal application updater for AppImage. */
  autoUpdater.autoDownload = false
  autoUpdater.autoInstallOnAppQuit = false
  autoUpdater.forceDevUpdateConfig = true
  // FIXME: Find some way to prevent if from logging
  // errors that are caught and handled.
  //autoUpdater.logger = Logger

  /**
   * Application auto update.
   *
   * We are using a class for EventEmitter's sake, it wants to return this which must be compatible with the API.
   */
  class AppAutoUpdater extends EventEmitter<AppAutoUpdaterEventMap> implements AppUpdater {
    #checkPromise: Promise<UpdateCheckResult | null> | undefined = undefined
    #cancelToken: CancellationToken | undefined = undefined
    #donwloadPromise: Promise<string[]> | undefined = undefined

    async #getUpdateInfo() {
      if (this.#checkPromise == null) {
        throw logError(new ReferenceError('Cannot get update information, no check in progress'))
      }

      let result
      try {
        result = await this.#checkPromise
      } catch (cause) {
        if (isNodeError(cause) && cause.code === 'ENOENT') {
          return undefined
        }

        throw cause
      }

      // If the result is null or the cancel token is null, no update is avilable.
      if (result?.cancellationToken == null) {
        return undefined
      }

      this.#cancelToken = result.cancellationToken

      return result.updateInfo
    }

    async #checkForUpdates() {
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

        return await this.#getUpdateInfo()
      } finally {
        this.#checkPromise = undefined
      }
    }

    async checkForUpdates() {
      if (this.#checkPromise != null) {
        return await this.#getUpdateInfo()
      }

      return await this.#checkForUpdates()
    }

    async #downloadUpdate() {
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
        await this.#downloadUpdate()
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

  const updater = autoBind(new AppAutoUpdater())

  const downloadWaiters = new WeakMap<WebContents, ProgressHandler>()
  const remoteDownloadUpdate = ipcHandle(async (ev) => {
    let handler = downloadWaiters.get(ev.sender)
    if (handler == null) {
      handler = (progress) => {
        ev.sender.send('update:download:progress', progress)
      }
      downloadWaiters.set(ev.sender, handler)
    }

    try {
      updater.on('progress', handler)
      await updater.downloadUpdate()
    } finally {
      updater.off('progress', handler)
      downloadWaiters.delete(ev.sender)
    }
  })

  ipcMain.handle('update:check', ipcProxy(updater.checkForUpdates.bind(updater)))
  ipcMain.handle('update:download', remoteDownloadUpdate)
  ipcMain.handle('update:cancel', ipcProxy(updater.cancelUpdate.bind(updater)))
  ipcMain.handle('update:install', ipcProxy(updater.installUpdate.bind(updater)))

  return updater
})

export default useUpdater
