import process from 'node:process'
import unhandled from 'electron-unhandled'

unhandled()

const initialize = async () => {
  const useLogging = await import('@main/plugins/log')
    .then(m => m.default)
  useLogging()

  const { doBoot } = await import('./boot')
    .then(m => m.default)
    .then(useBoot => useBoot())
  await doBoot()
}

initialize()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
