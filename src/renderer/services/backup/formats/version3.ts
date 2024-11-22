import { z } from 'zod'
import { DocHeader } from './version0'
import { Settings } from './version2'

/**
 * Layout v3, will be used in Export v3 but
 * may be reused by later versions.
 */
export type Layouts = z.output<typeof Layouts>
export const Layouts = z.object({
  sources: z.array(
    DocHeader.extend({
      title: z.string().min(1),
      image: z.string().min(1).nullable()
    })
  ),
  devices: z.array(
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

/**
 * Export format v3.
 */
export type Export = z.output<typeof Export>
export const Export = z.object({
  version: z.literal(3),
  settings: Settings,
  layouts: Layouts
})
