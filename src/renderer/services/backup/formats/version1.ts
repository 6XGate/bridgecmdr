import { z } from 'zod'
import { DocHeader } from './version0'
import type { Export as V2 } from './version2'

/**
 * Layout v1, will be used in Export v1 but
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
      switchId: z.string().uuid(),
      inputChannel: z.number().int(),
      outputChannels: z.object({
        video: z.number().int().optional(),
        audio: z.number().int().optional()
      })
    })
  )
})

/**
 * Export format v1.
 */
export const Export = z
  .object({
    version: z.literal(1),
    ...Layouts.shape
  })
  .transform(
    ({ sources, switches, ties }): V2 => ({
      version: 2,
      layouts: { sources, switches, ties }
    })
  )
