import { createSharedComposable } from '@vueuse/shared'
import { useClient } from './rpc/trpc'

const useStartup = createSharedComposable(function useStartup() {
  const client = useClient()
  const checkEnabled = async () => await client.startup.checkEnabled.query()
  const enable = async () => {
    await client.startup.enable.mutate()
  }
  const disable = async () => {
    await client.startup.disable.mutate()
  }

  return {
    checkEnabled,
    enable,
    disable
  }
})

export default useStartup
