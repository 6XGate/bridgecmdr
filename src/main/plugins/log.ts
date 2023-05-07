import log from 'electron-log'
import { memo } from 'radash'

const useLogging = memo(() => {
  log.initialize({ preload: true, spyRendererConsole: true })
  log.transports.console.format = '{h}:{i}:{s}.{ms} [{level}] › {text}'
  log.transports.file.level = 'debug'
  log.errorHandler.startCatching()

  return log
})

export default useLogging
