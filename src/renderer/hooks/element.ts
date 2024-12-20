import { useScroll, useResizeObserver } from '@vueuse/core'
import { toValue, watch, computed, ref } from 'vue'
import type { MaybeComputedElementRef } from '@vueuse/core'

interface ScrollingBoundsEntry {
  left: number
  top: number
  width: number
  height: number
}
interface ScrollingBounds {
  client: ScrollingBoundsEntry
  scrolling: ScrollingBoundsEntry
}

export function useElementScrollingBounds(el: MaybeComputedElementRef) {
  const scrolling = ref<ScrollingBounds>({
    client: { left: 0, top: 0, width: 0, height: 0 },
    scrolling: { left: 0, top: 0, width: 0, height: 0 }
  })

  useResizeObserver(el, function handleResize(entries) {
    for (const entry of entries) {
      const { target } = entry
      const { scrollLeft, scrollTop, scrollWidth, scrollHeight } = target
      const { clientLeft, clientTop, clientWidth, clientHeight } = target
      scrolling.value = {
        client: { left: scrollLeft, top: scrollTop, width: scrollWidth, height: scrollHeight },
        scrolling: { left: clientLeft, top: clientTop, width: clientWidth, height: clientHeight }
      }
    }
  })

  const $el = computed(function findElement() {
    const target = toValue(el)

    if (target == null) {
      return target
    }

    if (target instanceof HTMLElement || target instanceof SVGElement) {
      return target
    }

    return target.$el as HTMLElement | null | undefined
  })

  const scroll = useScroll($el)
  watch([scroll.x, scroll.y], function handleScroll(value) {
    scrolling.value.client.left = value[0]
    scrolling.value.client.top = value[1]
  })

  return scrolling
}
