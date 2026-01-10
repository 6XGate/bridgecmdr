import { z } from 'zod'
import { DocHeader } from './version0'
import type { Import } from './version4'

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
      outputChannels: z
        .object({
          video: z.number().int().optional(),
          audio: z.number().int().optional()
        })
        .default({})
    })
  )
})

/**
 * Backup parser for v1.
 */
export const Backup = z
  .object({
    version: z.literal(1),
    ...Layouts.shape
  })
  .transform(
    (payload): Import => ({
      version: 'normalized' as const,
      settings: {
        buttonOrder: payload.sources.map((source) => source._id)
      },
      layouts: {
        sources: payload.sources.map((source) => ({ order: 0, ...source })),
        devices: payload.switches,
        ties: payload.ties.map(({ switchId, outputChannels, ...tie }) => ({
          ...tie,
          deviceId: switchId,
          outputChannels: {
            video: outputChannels.video ?? undefined,
            audio: outputChannels.audio ?? undefined
          }
        }))
      }
    })
  )
