import log from 'electron-log'

const useAutoUpdater = async () => {
  const autoUpdater = await import('electron-updater').then(m => m.autoUpdater)

  log.transports.file.level = 'debug'
  autoUpdater.logger = log
  autoUpdater.checkForUpdatesAndNotify()
    .catch(e => { log.error(e) })
}

export default useAutoUpdater
