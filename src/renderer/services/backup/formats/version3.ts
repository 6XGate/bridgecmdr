import { z } from 'zod'
import { DocHeader } from './version0'
import { Settings } from './version2'
import type { Import } from './version4'

/**
 * Layout v3, will be used in Export v3.
 */
export type Layouts = z.output<typeof Layouts>
export const Layouts = z.object({
  sources: z.array(
    DocHeader.extend({
      order: z.number().nonnegative().finite().default(0),
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
 * Backup parser for v3.
 */
export const Backup = z
  .object({
    version: z.literal(3),
    settings: Settings,
    layouts: Layouts
  })
  .transform(function transformToV4(payload): Import {
    const sortedSources = payload.layouts.sources.sort((a, b) => a.order - b.order)
    const buttonOrder = sortedSources.map((source) => source._id)

    return {
      version: 'normalized' as const,
      settings: { ...payload.settings, buttonOrder },
      layouts: {
        sources: payload.layouts.sources,
        devices: payload.layouts.devices,
        ties: payload.layouts.ties.map(({ outputChannels, ...tie }) => ({
          ...tie,
          outputChannels: {
            video: outputChannels.video ?? undefined,
            audio: outputChannels.audio ?? undefined
          }
        }))
      }
    }
  })
