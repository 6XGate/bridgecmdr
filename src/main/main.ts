import { join as joinPath, resolve as resolvePath } from 'node:path'
import process from 'node:process'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { app, shell, BrowserWindow, nativeTheme } from 'electron'
import Logger from 'electron-log'
import { sleep } from 'radash'
import appIcon from '../../resources/icon.png?asset&asarUnpack'
import useApiServer from './server'
import { getAuthToken } from './services/trpc'
import { logError } from './utilities'
import { toError } from '@/error-handling'

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.

Logger.initialize({ preload: true, spyRendererConsole: true })
Logger.transports.console.format = '{h}:{i}:{s}.{ms} [{level}] › {text}'
Logger.transports.file.level = 'debug'
Logger.errorHandler.startCatching()

async function createWindow(port: number) {
  const willStartWithDark = nativeTheme.shouldUseDarkColors || nativeTheme.shouldUseInvertedColorScheme

  const window = new BrowserWindow({
    width: 800,
    height: 480,
    backgroundColor: willStartWithDark ? '#121212' : 'white',
    icon: appIcon,
    show: true,
    useContentSize: true
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

  /* eslint-disable no-await-in-loop -- Retry loop must be serial. */
  for (let tries = 3; tries > 0; --tries) {
    try {
      // HMR for renderer base on electron-vite cli.
      // Load the remote URL for development or the local html file for production.
      if (is.dev && process.env.ELECTRON_RENDERER_URL != null) {
        const url = new URL(process.env.ELECTRON_RENDERER_URL)
        url.searchParams.set('port', String(port))
        url.searchParams.set('auth', getAuthToken())
        await window.loadURL(url.toString())
      } else {
        await window.loadFile(joinPath(__dirname, '../renderer/index.html'), {
          query: { port: String(port), auth: getAuthToken() }
        })
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

// Set app user model id for windows
electronApp.setAppUserModelId('org.sleepingcats.BridgeCmdr')

const port = useApiServer()
await createWindow(port)
