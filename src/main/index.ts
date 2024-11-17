import { app } from 'electron'
import unhandled from 'electron-unhandled'

// Activate the unhandled handler...
unhandled()

async function main() {
  // Now boot the application.
  await import('./main')
}

main().catch((cause: unknown) => {
  console.error(cause)
  app.exit(1)
})
