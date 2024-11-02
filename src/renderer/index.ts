import log from 'electron-log'

//
// Earliest to enable logger.
//

if (import.meta.env.PROD) {
  log.errorHandler.startCatching()
}

//
// Dynamic load the main module.
//

async function main() {
  await import('./main')
}

main().catch((e: unknown) => {
  console.error('Fatal application boot failure', e)
})
