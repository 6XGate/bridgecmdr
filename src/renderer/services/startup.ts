import { createSharedComposable } from '@vueuse/shared'
import { useClient } from './rpc/trpc'

const useStartup = createSharedComposable(function useStartup() {
  const client = useClient()
  const checkEnabled = async () => await client.startup.checkEnabled.query()
  const checkUp = async () => {
    await client.startup.checkUp.mutate()
  }
  const enable = async () => {
    await client.startup.enable.mutate()
  }
  const disable = async () => {
    await client.startup.disable.mutate()
  }

  return {
    checkEnabled,
    checkUp,
    enable,
    disable
  }
})

export default useStartup
