import { nextTick } from 'vue'
import { useDialogs } from '../modals/dialogs'

export function useNextTick(fn: () => unknown) {
  const dialogs = useDialogs()

  return () => {
    nextTick()
      .then(fn)
      .catch(async (e: unknown) => {
        await dialogs.error(e)
      })
  }
}
