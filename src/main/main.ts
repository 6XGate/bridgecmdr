import { join as joinPath, resolve as resolvePath } from 'node:path'
import process from 'node:process'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { app, shell, BrowserWindow, nativeTheme } from 'electron'
import Logger from 'electron-log'
import { sleep } from 'radash'
import appIcon from '../../resources/icon.png?asset&asarUnpack'
import { useAppRouter } from './routes/router'
import useMigrations from './services/migration'
import { createIpcHandler } from './services/rpc/ipc'
import { logError } from './utilities'
import { toError } from '@/error-handling'

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.

Logger.transports.console.format = '{h}:{i}:{s}.{ms} [{level}] › {text}'
Logger.transports.file.level = 'debug'
Logger.errorHandler.startCatching()

async function createWindow() {
  const willStartWithDark = nativeTheme.shouldUseDarkColors || nativeTheme.shouldUseInvertedColorScheme

  const window = new BrowserWindow({
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

  window.removeMenu()
  if (import.meta.env.PROD) {
    window.setFullScreen(true)
  } else {
    window.webContents.openDevTools({ mode: 'undocked' })
  }

  // Open all new window links in the system browser.
  window.webContents.setWindowOpenHandler(function windowOpenHandler(details) {
    shell.openExternal(details.url).catch((e: unknown) => {
      Logger.error(e)
    })

    return { action: 'deny' }
  })

  const kWait = 2000
  let lastError: unknown

  window.webContents.on('console-message', (_, level, message) => {
    switch (level) {
      case 0:
        Logger.verbose(message)
        break
      case 1:
        Logger.info(message)
        break
      case 2:
        Logger.warn(message)
        break
      case 3:
        Logger.error(message)
        break
      default:
        Logger.log(message)
        break
    }
  })

  /* eslint-disable no-await-in-loop -- Retry loop must be serial. */
  for (let tries = 3; tries > 0; --tries) {
    try {
      // HMR for renderer base on electron-vite cli.
      // Load the remote URL for development or the local html file for production.
      if (is.dev && process.env.ELECTRON_RENDERER_URL != null) {
        await window.loadURL(process.env.ELECTRON_RENDERER_URL)
      } else {
        await window.loadFile(joinPath(__dirname, '../renderer/index.html'))
      }

      return window
    } catch (e) {
      lastError = e
      Logger.warn(e)

      await sleep(kWait)
    }
  }

  /* eslint-enable no-await-in-loop */
  throw logError(toError(lastError))
}

// Let's change the web session path.
const configDir = app.getPath('userData')
app.setPath('sessionData', resolvePath(configDir, '.websession'))

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  app.quit()
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

// This method will be called when Electron has finished
// initialization and is ready to create browser
// windows. Some APIs can only be used after
// this event occurs.
await app.whenReady()

const migrate = useMigrations()
await migrate().catch((cause: unknown) => {
  Logger.error(cause)
})

// Set app user model id for windows
electronApp.setAppUserModelId('org.sleepingcats.BridgeCmdr')

// If macOS close vs quit behavior is reimplemented, we will have
// to make sure port and handler are accessible earlier.
const handler = createIpcHandler({ router: useAppRouter() })
handler.attachWindow(await createWindow())
