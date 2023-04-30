import log from 'electron-log'

const useLogging = () => {
  log.initialize({ preload: true })
}

export default useLogging
