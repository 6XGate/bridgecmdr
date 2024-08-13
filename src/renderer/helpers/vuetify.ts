import { toValue } from '@vueuse/shared'
import { computed, ref } from 'vue'
import { z } from 'zod'
import { useElementScrollingBounds } from './element'
import type { MaybeRefOrGetter } from '@vueuse/shared'
import type { ComponentPublicInstance } from 'vue'

const Block = ['top', 'bottom'] as const
type Block = (typeof Block)[number]

const Inline = ['start', 'end', 'left', 'right'] as const
type Inline = (typeof Inline)[number]

export type Anchor =
  | Block
  | Inline
  | 'center'
  | 'center center'
  | `${Block} ${Inline | 'center'}`
  | `${Inline} ${Block | 'center'}`

export type Origin = 'auto' | Anchor | 'overlap'

export type SelectItemKey =
  | boolean // Ignored
  | string // Lookup by key, can use dot notation for nested objects
  | (string | number)[] // Nested lookup by key, each array item is a key in the next level
  | ((item: Record<string, unknown>, fallback?: unknown) => unknown)

export type ResponsiveModalOptions = z.input<typeof ResponsiveModalOptions>
export const ResponsiveModalOptions = z.object({
  rounded: z.union([z.boolean(), z.string(), z.number()]).default('xl'),
  scrim: z.union([z.boolean(), z.string()]).default(true),
  width: z.number().optional(),
  height: z.number().optional(),
  minWidth: z.number().optional(),
  minHeight: z.number().optional(),
  maxWidth: z.number().optional(),
  maxHeight: z.number().optional()
})

const DialogProps = ResponsiveModalOptions.pick({
  scrim: true,
  width: true,
  height: true,
  minWidth: true,
  minHeight: true,
  maxWidth: true,
  maxHeight: true
})

const CardProps = ResponsiveModalOptions.pick({
  rounded: true
})

export const useResponsiveModal = (
  breakpoint: MaybeRefOrGetter<boolean>,
  options: MaybeRefOrGetter<ResponsiveModalOptions> = {}
) => {
  const dialogProps = computed(() =>
    toValue(breakpoint)
      ? { fullscreen: true, scrim: false, scrollable: true }
      : { ...DialogProps.parse(toValue(options)), scrollable: true }
  )

  const cardProps = computed(() =>
    toValue(breakpoint) ? { rounded: false } : { ...CardProps.parse(toValue(options)) }
  )

  const isFullscreen = computed(() => toValue(breakpoint))

  const body = ref<ComponentPublicInstance | null>(null)
  const scrolling = useElementScrollingBounds(body)
  const showDividers = computed(() => scrolling.value.client.height !== scrolling.value.scrolling.height)

  return {
    body,
    dialogProps,
    cardProps,
    isFullscreen,
    showDividers
  }
}
