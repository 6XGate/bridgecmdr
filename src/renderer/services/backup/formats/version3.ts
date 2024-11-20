import { z } from 'zod'
import { ColorScheme, IconSize, PowerOffTaps } from '../../settings'
import { DocHeader } from './version0'

export type Layouts = z.output<typeof Layouts>
export const Layouts = z.object({
  sources: z.array(
    DocHeader.extend({
      title: z.string().min(1),
      image: z.string().min(1).nullable()
    })
  ),
  switches: z.array(
    DocHeader.extend({
      driverId: z.string().uuid(),
      title: z.string(),
      path: z.string()
    })
  ),
  ties: z.array(
    DocHeader.extend({
      sourceId: z.string().uuid(),
      deviceId: z.string().uuid(),
      inputChannel: z.number().int(),
      outputChannels: z.object({
        video: z.number().int().optional(),
        audio: z.number().int().optional()
      })
    })
  )
})

export type Export = z.output<typeof Export>
export const Export = z.object({
  version: z.literal(3),
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
