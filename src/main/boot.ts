import { join as joinPath } from 'node:path'
import process from 'node:process'
import { devTools, electronApp, optimizer, is } from '@electron-toolkit/utils'
import { app, shell, BrowserWindow, nativeTheme } from 'electron'
import useDriverPlugin from '@main/plugins/drivers'
import useLevelDownPlugin from '@main/plugins/level'
import useSerialPortsPlugin from '@main/plugins/ports'
import useAutoStartPlugin from '@main/plugins/startup'
import useSystemPlugin from '@main/plugins/system'
import useWebCryptoPlugin from '@main/plugins/webcrypo'
import useHandles from '@main/system/handle'
import log from 'electron-log'
import useAutoUpdater from './plugins/updater'

const waitTill = async (timeout: number) => {
  await new Promise<void>(resolve => {
    setTimeout(resolve, timeout)
  })
}

const useApplicationBoot = () => {
  const { shutDown } = useHandles()

  const createWindow = async () => {
    const willStartWithDark = nativeTheme.shouldUseDarkColors ||
      nativeTheme.shouldUseInvertedColorScheme

    const main = new BrowserWindow({
      width: 800,
      height: 480,
      backgroundColor: willStartWithDark ? '#121212' : 'white',
      show: true,
      useContentSize: true,
      webPreferences: {
        preload: joinPath(__dirname, '../preload/index.js')
      }
    })

    main.removeMenu()
    if (import.meta.env.PROD) {
      main.setFullScreen(true)
    } else {
      main.webContents.openDevTools({ mode: 'undocked' })
    }

    main.webContents.setWindowOpenHandler(details => {
      shell.openExternal(details.url)
        .catch(e => { log.error(e) })

      return { action: 'deny' }
    })

    const kWait = 2000
    const load = async () => {
      let lastError: unknown
      for (let tries = 3; tries > 0; --tries) {
        try {
          // HMR for renderer base on electron-vite cli.
          // Load the remote URL for development or the local html file for production.
          if (is.dev && process.env['ELECTRON_RENDERER_URL'] != null) {
            await main.loadURL(process.env['ELECTRON_RENDERER_URL'])
          } else {
            await main.loadFile(joinPath(__dirname, '../renderer/index.html'))
          }

          return
        } catch (e) {
          lastError = e
          log.warn(e)

          await waitTill(kWait)
        }
      }

      log.error(lastError)
    }

    await load()
  }

  // Quit when all windows are closed, except on macOS. There, it's common
  // for applications and their menu bar to stay active until the user quits
  // explicitly with Cmd + Q.
  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })

  // Make sure all handles have been closed.
  app.on('will-quit', () => {
    process.nextTick(async () => { await shutDown() })
  })

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (...[, window]) => {
    optimizer.watchWindowShortcuts(window)
  })

  // Attempt a clean shutdown if SIGTERM is received.
  process.on('SIGTERM', () => {
    for (const window of BrowserWindow.getAllWindows()) {
      window.close()
    }
  })

  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow().catch(e => { log.error(e) })
    }
  })

  const doBoot = async () => {
    // Add application information.
    process.env['app_version_'] = app.getVersion()
    process.env['app_name_'] = app.getName()
    process.env['user_locale_'] = app.getLocale()

    // This method will be called when Electron has finished
    // initialization and is ready to create browser windows.
    // Some APIs can only be used after this event occurs.
    await app.whenReady()

    // Set app user model id for windows
    electronApp.setAppUserModelId('org.sleepingcats.BridgeCmdr')

    if (import.meta.env.DEV) {
      // DevTools plug-ins
      await devTools.install('VUEJS_DEVTOOLS', { allowFileAccess: true })
    }

    await useAutoUpdater()
    useSystemPlugin()
    useWebCryptoPlugin()
    useAutoStartPlugin()
    await useDriverPlugin()
    useSerialPortsPlugin()
    useLevelDownPlugin()

    await createWindow()
  }

  return {
    doBoot
  }
}

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
export default useApplicationBoot
