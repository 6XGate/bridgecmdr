import unhandled from 'electron-unhandled'

const initialize = async () => {
  // Activate the unhandle handler...
  unhandled()

  // Now boot the application.
  const { startBridgeCmdr } = await import('./boot')
  await startBridgeCmdr()
}

initialize()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
