import { z } from 'zod'
import { ColorScheme, IconSize, PowerOffTaps } from '../../settings'
import { Layouts } from './version1'

export type Export = z.output<typeof Export>
export const Export = z.object({
  version: z.literal(2),
  settings: z
    .object({
      iconSize: IconSize.optional(),
      colorScheme: ColorScheme.optional(),
      powerOnSwitchesAtStart: z.boolean().optional(),
      powerOffWhen: PowerOffTaps.optional()
    })
    .optional(),
  layouts: Layouts
})
