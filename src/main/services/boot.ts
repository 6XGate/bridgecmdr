import { basename } from 'node:path'
import Logger from 'electron-log'
import { z } from 'zod'

const BootModule = z.object({
  boot: z.function(z.tuple([]), z.unknown())
})

export default function useBootOperations() {
  Logger.debug('Loading boot modules')
  const bootModules = import.meta.glob('../boot/**/*', { eager: true })
  return async function boot() {
    Logger.debug('Starting boot up')
    for (const [name, module] of Object.entries(bootModules)) {
      const bootable = BootModule.parse(module)
      Logger.debug(`Attempting boot: ${basename(name, '.ts')}`)
      // eslint-disable-next-line no-await-in-loop -- Design to allow serialization.
      await bootable.boot()
    }
  }
}
