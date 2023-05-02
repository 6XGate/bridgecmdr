import log from 'electron-log'

const useLogging = () => {
  log.initialize({ preload: true, spyRendererConsole: true })
  log.transports.console.format = '{h}:{i}:{s}.{ms} [{level}] › {text}'
  log.transports.file.level = 'debug'
  log.errorHandler.startCatching()
}

export default useLogging
