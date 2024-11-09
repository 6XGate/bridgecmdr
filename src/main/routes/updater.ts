import { observable } from '@trpc/server/observable'
import { memo } from 'radash'
import { procedure, router } from '../services/trpc'
import useUpdater from '../services/updater'
import type { AppUpdaterEventMap } from '../services/updater'

const useUpdaterRouter = memo(function useUpdaterRouter() {
  const updater = useUpdater()

  function defineEvent<Name extends keyof AppUpdaterEventMap>(name: Name) {
    type Args = AppUpdaterEventMap[Name]
    // TODO: tRPC 11, use "for await...of on" with AbortSignal
    return () =>
      observable<Args>((emit) => {
        const proxy = (...args: Args) => {
          emit.next(args)
        }

        updater.on(name, proxy as never)

        return () => {
          updater.off(name, proxy as never)
        }
      })
  }

  return router({
    onChecking: procedure.subscription(defineEvent('checking')),
    onAvailable: procedure.subscription(defineEvent('available')),
    onProgress: procedure.subscription(defineEvent('progress')),
    onDownloaded: procedure.subscription(defineEvent('downloaded')),
    onCancelled: procedure.subscription(defineEvent('cancelled')),
    checkForUpdates: procedure.query(async () => await updater.checkForUpdates()),
    downloadUpdate: procedure.query(async () => {
      await updater.downloadUpdate()
    }),
    cancelUpdate: procedure.query(async () => {
      await updater.cancelUpdate()
    }),
    installUpdate: procedure.query(async () => {
      await updater.installUpdate()
    })
  })
})

export default useUpdaterRouter
