import { usePreferredColorScheme } from '@vueuse/core'
import { defineStore } from 'pinia'
import { readonly, computed } from 'vue'
import { z } from 'zod'
import { useUserStorage } from './data/storage'
import useStartup from './startup'
import type { UseStorageOptions } from '@vueuse/core'

interface JsonObject {
  [property: string]: JsonValue
}
type JsonValue = null | boolean | number | string | JsonValue[] | JsonObject
const JsonValue = z.string().transform((data) => JSON.parse(data) as JsonValue)

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Need to match anything, as Zod does.
type JsonType = z.ZodType<any, any, JsonValue> | z.ZodCatch<z.ZodType<any, any, JsonValue>>

const kIconSizes = [48, 64, 96, 128, 192, 256] as const
export type IconSize = z.infer<typeof IconSize>
export const IconSize = z.custom<(typeof kIconSizes)[number]>((value) => kIconSizes.includes(value as never))

export type PowerOffTaps = z.infer<typeof PowerOffTaps>
export const PowerOffTaps = z.enum(['single', 'double'])

export type ColorScheme = z.infer<typeof ColorScheme>
export const ColorScheme = z.enum(['light', 'dark', 'no-preference'])

function useSchema<Schema extends JsonType>(schema: Schema, deep = false) {
  return {
    deep,
    listenToStorageChanges: true,
    writeDefaults: true,
    serializer: {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return -- TS is unable to infer properly.
      read: (raw) => JsonValue.pipe(schema).parse(raw),
      write: (value) => JSON.stringify(value)
    }
  } satisfies UseStorageOptions<z.output<Schema>>
}

const useSettings = defineStore('settings', function defineSettings() {
  const iconSize = useUserStorage('iconSize', 128, useSchema(IconSize))
  const iconSizes = readonly(kIconSizes)

  const preferredColorScheme = usePreferredColorScheme()
  const colorScheme = useUserStorage('colorScheme', 'no-preference', useSchema(ColorScheme.catch('no-preference')))
  const colorSchemes = readonly(ColorScheme.options)
  const activeColorScheme = computed(function getActiveColorSchema() {
    if (colorScheme.value === 'no-preference') {
      return preferredColorScheme.value === 'no-preference' ? 'light' : 'dark'
    }

    return colorScheme.value
  })

  const powerOnSwitchesAtStart = useUserStorage('powerOnSwitchesAtStart', false, useSchema(z.boolean()))

  const powerOffWhen = useUserStorage('powerOffWhen', 'single', useSchema(PowerOffTaps))
  const powerOffWhenOptions = readonly(PowerOffTaps.options)

  const startup = useStartup()

  return {
    iconSize,
    iconSizes,
    colorScheme,
    colorSchemes,
    activeColorScheme,
    powerOnSwitchesAtStart,
    powerOffWhen,
    powerOffWhenOptions,
    checkAutoStart: startup.checkEnabled,
    enableAutoStart: startup.enable,
    disableAutoStart: startup.disable
  }
})

export default useSettings
