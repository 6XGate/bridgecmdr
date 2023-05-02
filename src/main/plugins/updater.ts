import { writeFile } from 'node:fs/promises'
import { resolve as resolvePath } from 'node:path'
import { app, ipcMain } from 'electron'
import log from 'electron-log'
import { ipcHandle } from '@main/utilities'
import type { WebContents } from 'electron'
import type { UpdateCheckResult, ProgressInfo, CancellationToken } from 'electron-updater'

const useAutoUpdater = async () => {
  const autoUpdater = await import('electron-updater').then(m => m.autoUpdater)

  autoUpdater.autoDownload = false
  autoUpdater.autoInstallOnAppQuit = false
  autoUpdater.logger = log

  autoUpdater.forceDevUpdateConfig = true

  const downloadWaiters = new Set<WebContents>()

  let checkPromise: Promise<UpdateCheckResult | null> | undefined
  let cancelToken: CancellationToken | undefined
  let donwloadPromise: Promise<string[]> | undefined

  const checkForUpdates = async () => {
    if (donwloadPromise != null) {
      throw new ReferenceError('Update download already in progress')
    }

    try {
      if (import.meta.env.DEV) {
        // Force update check on for testing.
        const installPath = resolvePath(app.getAppPath(), 'out', 'BridgeCmdr')
        await writeFile(installPath, '')
        process.env['APPIMAGE'] = installPath
      }

      checkPromise = autoUpdater.checkForUpdates()

      return await getUpdateInfo()
    } finally {
      checkPromise = undefined
    }
  }

  const getUpdateInfo = async () => {
    if (checkPromise == null) {
      throw new ReferenceError('Cannot get update information, no check in progress')
    }

    const result = await checkPromise

    // If the result is null or the cancel token is null, no update is avilable.
    if (result == null || result.cancellationToken == null) {
      return undefined
    }

    cancelToken = result.cancellationToken

    return result.updateInfo
  }

  ipcMain.handle('update:check', ipcHandle(async () => {
    if (checkPromise != null) {
      return await getUpdateInfo()
    }

    return await checkForUpdates()
  }))

  const trackDownload = async (sender: WebContents, createOrGetPromise: () => Promise<string[]>) => {
    const handleProgress = (progress: ProgressInfo) => {
      sender.send('update:download:progress', progress)
    }

    if (downloadWaiters.has(sender)) {
      await createOrGetPromise()
    } else {
      try {
        autoUpdater.on('download-progress', handleProgress)
        const promise = createOrGetPromise()
        downloadWaiters.add(sender)

        await promise
      } finally {
        autoUpdater.off('download-progress', handleProgress)
        downloadWaiters.delete(sender)
        cancelToken = undefined
      }
    }
  }

  const downloadUpdate = async (sender: WebContents) => {
    if (cancelToken == null) {
      throw new ReferenceError('No update available for download, check first')
    }

    // eslint-disable-next-line @typescript-eslint/promise-function-async -- Not an operation
    await trackDownload(sender, () => (donwloadPromise = autoUpdater.downloadUpdate(cancelToken)))
  }

  const waitOnDownload = async (sender: WebContents) => {
    const promise = donwloadPromise
    if (promise == null) {
      throw new ReferenceError('Cannot track download, no download in progress')
    }

    // eslint-disable-next-line @typescript-eslint/promise-function-async -- Not an operation
    await trackDownload(sender, () => promise)
  }

  ipcMain.handle('update:download', ipcHandle(async ev => {
    if (donwloadPromise != null) {
      await waitOnDownload(ev.sender)
    } else {
      await downloadUpdate(ev.sender)
    }
  }))

  ipcMain.handle('update:cancel', ipcHandle(() => {
    if (cancelToken == null || cancelToken.cancelled) {
      return
    }

    cancelToken.cancel()
  }))

  ipcMain.handle('update:install', ipcHandle(() => {
    autoUpdater.quitAndInstall()
  }))
}

export default useAutoUpdater
