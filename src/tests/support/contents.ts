import EventEmitter from 'node:events'
import { notImplemented } from './reactor'
import type { IpcReactor } from './reactor'
import type { IpcMain, WebContents } from 'electron'

export class MockWebContents extends EventEmitter implements WebContents {
  readonly reactor: IpcReactor
  readonly audioMuted = false
  readonly backgroundThrottling = false
  readonly debugger = {} as Electron.Debugger
  readonly devToolsWebContents = null as Electron.WebContents | null
  readonly frameRate = 60
  readonly hostWebContents = this // Electron.WebContents
  readonly id = 1
  readonly mainFrame = {} as Electron.WebFrameMain
  readonly navigationHistory = {} as Electron.NavigationHistory
  readonly opener = {} as Electron.WebFrameMain
  readonly session = {} as Electron.Session
  readonly userAgent = ''
  readonly zoomFactor = 1
  readonly zoomLevel = 1
  readonly ipc = {} as IpcMain

  constructor(reactor: IpcReactor) {
    super()
    this.reactor = reactor

    reactor.getWebContents = () => this
  }

  // If used:
  // get ipc() {
  //   return this.reactor.getIpcMain()
  // }

  isAudioMuted = notImplemented()
  getBackgroundThrottling = notImplemented()
  getProcessId = notImplemented()
  getOSProcessId = notImplemented()
  getUserAgent = notImplemented()
  getZoomFactor = notImplemented()
  getZoomLevel = notImplemented()

  // -- To improve coveration, not implemented till needed.
  // isAudioMuted = () => this.audioMuted
  // getBackgroundThrottling = () => this.backgroundThrottling
  // getProcessId = () => 1
  // getOSProcessId = () => 999
  // getUserAgent = () => this.userAgent
  // getZoomFactor = () => this.zoomFactor
  // getZoomLevel = () => this.zoomLevel
  isDestroyed = () => false

  send(channel: string, ...args: unknown[]): void {
    this.reactor.emitToRenderer(channel, ...args)
  }

  addWorkSpace = notImplemented()
  adjustSelection = notImplemented()
  beginFrameSubscription = notImplemented()
  canGoBack = notImplemented()
  canGoForward = notImplemented()
  canGoToOffset = notImplemented()
  capturePage = notImplemented()
  centerSelection = notImplemented()
  clearHistory = notImplemented()
  close = notImplemented()
  closeDevTools = notImplemented()
  copy = notImplemented()
  copyImageAt = notImplemented()
  cut = notImplemented()
  delete = notImplemented()
  disableDeviceEmulation = notImplemented()
  downloadURL = notImplemented()
  enableDeviceEmulation = notImplemented()
  endFrameSubscription = notImplemented()
  executeJavaScript = notImplemented()
  executeJavaScriptInIsolatedWorld = notImplemented()
  findInPage = notImplemented()
  focus = notImplemented()
  forcefullyCrashRenderer = notImplemented()
  getAllSharedWorkers = notImplemented()
  getDevToolsTitle = notImplemented()
  getFrameRate = notImplemented()
  getMediaSourceId = notImplemented()
  getPrintersAsync = notImplemented()
  getTitle = notImplemented()
  getType = notImplemented()
  getURL = notImplemented()
  getWebRTCIPHandlingPolicy = notImplemented()
  getWebRTCUDPPortRange = notImplemented()
  goBack = notImplemented()
  goForward = notImplemented()
  goToIndex = notImplemented()
  goToOffset = notImplemented()
  insertCSS = notImplemented()
  insertText = notImplemented()
  inspectElement = notImplemented()
  inspectServiceWorker = notImplemented()
  inspectSharedWorker = notImplemented()
  inspectSharedWorkerById = notImplemented()
  invalidate = notImplemented()
  isBeingCaptured = notImplemented()
  isCrashed = notImplemented()
  isCurrentlyAudible = notImplemented()
  isDevToolsFocused = notImplemented()
  isDevToolsOpened = notImplemented()
  isFocused = notImplemented()
  isLoading = notImplemented()
  isLoadingMainFrame = notImplemented()
  isOffscreen = notImplemented()
  isPainting = notImplemented()
  isWaitingForResponse = notImplemented()
  loadFile = notImplemented()
  loadURL = notImplemented()
  openDevTools = notImplemented()
  paste = notImplemented()
  pasteAndMatchStyle = notImplemented()
  postMessage = notImplemented()
  print = notImplemented()
  printToPDF = notImplemented()
  redo = notImplemented()
  reload = notImplemented()
  reloadIgnoringCache = notImplemented()
  removeInsertedCSS = notImplemented()
  removeWorkSpace = notImplemented()
  replace = notImplemented()
  replaceMisspelling = notImplemented()
  savePage = notImplemented()
  scrollToBottom = notImplemented()
  scrollToTop = notImplemented()
  selectAll = notImplemented()
  sendInputEvent = notImplemented()
  sendToFrame = notImplemented()
  setAudioMuted = notImplemented()
  setBackgroundThrottling = notImplemented()
  setDevToolsTitle = notImplemented()
  setDevToolsWebContents = notImplemented()
  setFrameRate = notImplemented()
  setIgnoreMenuShortcuts = notImplemented()
  setImageAnimationPolicy = notImplemented()
  setUserAgent = notImplemented()
  setVisualZoomLevelLimits = notImplemented()
  setWebRTCIPHandlingPolicy = notImplemented()
  setWebRTCUDPPortRange = notImplemented()
  setWindowOpenHandler = notImplemented()
  setZoomFactor = notImplemented()
  setZoomLevel = notImplemented()
  showDefinitionForSelection = notImplemented()
  startDrag = notImplemented()
  startPainting = notImplemented()
  stop = notImplemented()
  stopFindInPage = notImplemented()
  stopPainting = notImplemented()
  takeHeapSnapshot = notImplemented()
  toggleDevTools = notImplemented()
  undo = notImplemented()
  unselect = notImplemented()
}
