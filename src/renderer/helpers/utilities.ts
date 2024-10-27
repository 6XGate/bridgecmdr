import { useDialogs } from '../modals/dialogs'

export const forceUndefined = <T>() => undefined as T

export function useGuardedAsyncOp(fn: () => Promise<unknown>) {
  const dialogs = useDialogs()

  return async () => {
    await fn().catch(async (e: unknown) => {
      await dialogs.error(e)
    })
  }
}
