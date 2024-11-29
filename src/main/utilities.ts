import Logger from 'electron-log'

export function logError<E extends Error>(e: E) {
  Logger.error(e)
  return e
}
