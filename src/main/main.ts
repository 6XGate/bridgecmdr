import { join as joinPath, resolve as resolvePath } from 'node:path'
import process from 'node:process'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { app, shell, BrowserWindow, nativeTheme } from 'electron'
import Logger from 'electron-log'
import appIcon from '../../resources/icon.png?asset&asarUnpack'
import registerDrivers from './plugins/drivers'
import usePorts from './plugins/ports'
import useCrypto from './plugins/webcrypto'
import useDrivers from './services/driver'
import useHandles from './services/handle'
import useLevelServer from './services/level'
import useStartup from './services/startup'
import useSystem from './services/system'
import useUpdater from './services/updater'
import { logError } from './utilities'
import { toError } from '@/error-handling'

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.

Logger.initialize({ preload: true, spyRendererConsole: true })
Logger.transports.console.format = '{h}:{i}:{s}.{ms} [{level}] › {text}'
Logger.transports.file.level = 'debug'
Logger.errorHandler.startCatching()

async function waitTill(timeout: number) {
  await new Promise<void>((resolve) => {
    setTimeout(resolve, timeout)
  })
}

async function createWindow() {
  const willStartWithDark = nativeTheme.shouldUseDarkColors || nativeTheme.shouldUseInvertedColorScheme

  const main = new BrowserWindow({
    width: 800,
    height: 480,
    backgroundColor: willStartWithDark ? '#121212' : 'white',
    icon: appIcon,
    show: true,
    useContentSize: true,
    webPreferences: {
      preload: joinPath(__dirname, '../preload/index.mjs'),
      sandbox: false
    }
  })

  main.removeMenu()
  if (import.meta.env.PROD) {
    main.setFullScreen(true)
  } else {
    main.webContents.openDevTools({ mode: 'undocked' })
  }

  main.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url).catch((e: unknown) => {
      Logger.error(e)
    })

    return { action: 'deny' }
  })

  const kWait = 2000
  let lastError: unknown

  for (let tries = 3; tries > 0; --tries) {
    try {
      // HMR for renderer base on electron-vite cli.
      // Load the remote URL for development or the local html file for production.
      if (is.dev && process.env.ELECTRON_RENDERER_URL != null) {
        // eslint-disable-next-line no-await-in-loop -- Retry loop must be serial.
        await main.loadURL(process.env.ELECTRON_RENDERER_URL)
      } else {
        // eslint-disable-next-line no-await-in-loop -- Retry loop must be serial.
        await main.loadFile(joinPath(__dirname, '../renderer/index.html'))
      }

      return main
    } catch (e) {
      lastError = e
      Logger.warn(e)

      // eslint-disable-next-line no-await-in-loop -- Retry loop must be serial.
      await waitTill(kWait)
    }
  }

  throw logError(toError(lastError))
}

// Add application information.
process.env['app_version_'] = app.getVersion()
process.env['app_name_'] = app.getName()
process.env['user_locale_'] = app.getLocale()

// Let's change the web session path.
const configDir = app.getPath('userData')
app.setPath('sessionData', resolvePath(configDir, '.websession'))

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// Make sure all handles have been closed.
const { shutDown } = useHandles()
app.on('will-quit', () => {
  process.nextTick(async () => {
    await shutDown()
  })
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
    createWindow().catch((e: unknown) => {
      Logger.error(e)
    })
  }
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
await app.whenReady()

// Set app user model id for windows
electronApp.setAppUserModelId('org.sleepingcats.BridgeCmdr')

useCrypto()
usePorts()
useUpdater()
useSystem()
useLevelServer()
useDrivers()
registerDrivers()
await useStartup()

await createWindow()
