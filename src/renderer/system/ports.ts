import is from '@sindresorhus/is'
import { createSharedComposable } from '@vueuse/shared'
import { ref, computed, readonly, reactive } from 'vue'
import { trackBusy } from '../utilities/tracking'
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

    items.value = ports.map(port => {
      // If there is no PnP ID, then just use the path.
      if (!is.nonEmptyString(port.pnpId)) {
        return {
          title: port.path,
          value: port.path
        }
      }

      // The PnP ID seems to be based on this format;
      // ${bus}-${snake_style_label}-${positions.join('-')},
      // where:
      // - bus: 'usb' | 'tty' | etc.
      // - snake_style_label: 'Friendly_name_in_snake_style'
      // - positions: Array<`port{number}` | `if{number}`>

      // First, split by hyphen, this should produce
      // the bus/label/position combo.
      let labelParts = port.pnpId.split('-')
      if (labelParts.length < 3) {
        return {
          title: port.path,
          value: port.path
        }
      }

      // Pop any positions off the end.
      for (;;) {
        const part = labelParts.at(-1)
        if (part == null) {
          return {
            title: port.path,
            value: port.path
          }
        }

        if (/^port\d+$/u.test(part)) {
          labelParts.pop()
        } else if (/^if\d+$/u.test(part)) {
          labelParts.pop()
        } else {
          break
        }
      }

      // Slice off the bus.
      labelParts = labelParts.slice(1)
      if (labelParts.length === 0) {
        return {
          title: port.path,
          value: port.path
        }
      }

      // Now, rejoin the label by hypens, in case
      // those were in the friendly name, and
      // replace underscores with spaces.
      return {
        title: labelParts.join('-').replace(/_/gu, ' '),
        value: port.path
      }
    })
  })

  return reactive({
    isBusy: tracker.isBusy,
    error: tracker.error,
    items: computed(() => readonly(items.value)),
    all
  })
})

export default usePorts
