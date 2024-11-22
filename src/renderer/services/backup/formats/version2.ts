import { z } from 'zod'
import { ColorScheme, IconSize, PowerOffTaps } from '../../settings'
import { Layouts } from './version1'

/**
 * Settings v2, will be used in Export v2 but
 * may be reused by later versions.
 */
export type Settings = z.output<typeof Settings>
export const Settings = z
  .object({
    iconSize: IconSize.optional(),
    colorScheme: ColorScheme.optional(),
    powerOnSwitchesAtStart: z.boolean().optional(),
    powerOffWhen: PowerOffTaps.optional()
  })
  .optional()

/**
 * Export format v2.
 */
export type Export = z.output<typeof Export>
export const Export = z.object({
  version: z.literal(2).transform(() => 3 as const),
  settings: Settings,
  layouts: Layouts.transform(({ sources, switches, ties }) => ({ sources, devices: switches, ties }))
})
