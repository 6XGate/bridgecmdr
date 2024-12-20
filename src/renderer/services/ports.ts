import { createSharedComposable } from '@vueuse/shared'
import { ref, computed, readonly, reactive } from 'vue'
import { trackBusy } from '../hooks/tracking'
import { useClient } from './rpc/trpc'
import type { PortEntry } from '../../preload/api'

export type { PortEntry } from '../../preload/api'

const usePorts = createSharedComposable(function usePorts() {
  const tracker = trackBusy()
  const client = useClient()

  const items = ref(new Array<PortEntry>())

  const all = tracker.track(async function all() {
    items.value = await client.ports.list.query()
  })

  return reactive({
    isBusy: tracker.isBusy,
    error: tracker.error,
    items: computed(() => readonly(items.value)),
    all
  })
})

export default usePorts
