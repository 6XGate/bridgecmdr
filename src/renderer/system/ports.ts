import is from '@sindresorhus/is'
import { createSharedComposable } from '@vueuse/shared'
import { ref, computed, readonly, reactive } from 'vue'
import { trackBusy } from '@/utilities/tracking'
import useBridgedApi from './bridged'

export interface PortData {
  title: string
  value: string
}

const usePorts = createSharedComposable(() => {
  const tracker = trackBusy()

  const api = useBridgedApi()

  const items = ref<PortData[]>([])

  const all = tracker.track(async () => {
    const ports = await api.ports.list()
    items.value = ports.map(port =>
      (is.nonEmptyString(port.pnpId)
        // Use the 'by-id' path from the PNP-ID
        ? ({
            title: 'TODO: Label',
            value: `/dev/serial/by-id/${port.pnpId}`
          })
        // Use the plain path, which is less stable.
        : ({
            title: port.path,
            value: port.path
          })
      )
    )
  })

  return reactive({
    isBusy: tracker.isBusy,
    error: tracker.error,
    items: computed(() => readonly(items.value)),
    all
  })
})

export default usePorts
