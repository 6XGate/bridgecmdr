import { z } from 'zod'
import { ButtonOrder, ColorScheme, IconSize, PowerOffTaps } from '../../settings'

/** v4 general document header. */
export const DocHeader = z.object({
  id: z.string().uuid().toUpperCase()
})

/**
 * Layout v4, will be used in Export v4 but
 * may be reused by later versions.
 */
export type Layouts = z.output<typeof Layouts>
export const Layouts = z.object({
  sources: z.array(
    DocHeader.extend({
      title: z.string().min(1),
      image: z.string().nullish()
    })
  ),
  devices: z.array(
    DocHeader.extend({
      driverId: z.string().uuid().toUpperCase(),
      title: z.string(),
      path: z.string()
    })
  ),
  ties: z.array(
    DocHeader.extend({
      sourceId: z.string().uuid().toUpperCase(),
      deviceId: z.string().uuid().toUpperCase(),
      inputChannel: z.number().int(),
      outputVideoChannel: z.number().int().nullish(),
      outputAudioChannel: z.number().int().nullish()
    })
  )
})

/**
 * Settings v4, will be used in Export v4 but
 * may be reused by later versions.
 */
export type Settings = z.output<typeof Settings>
export const Settings = z
  .object({
    iconSize: IconSize.optional(),
    colorScheme: ColorScheme.optional(),
    powerOnSwitchesAtStart: z.boolean().optional(),
    powerOffWhen: PowerOffTaps.optional(),
    buttonOrder: ButtonOrder.optional()
  })
  .nullish()

/**
 * Backup parser for v4.
 */
export const Backup = z
  .object({
    version: z.literal(4),
    settings: Settings,
    layouts: Layouts
  })
  .transform((payload) => ({
    version: 'normalized' as const,
    settings: payload.settings,
    layouts: {
      sources: payload.layouts.sources.map(({ id, image = null, ...source }) => ({
        _id: id,
        order: 0,
        image,
        ...source
      })),
      devices: payload.layouts.devices.map(({ id, ...device }) => ({
        _id: id,
        ...device
      })),
      ties: payload.layouts.ties.map(({ id, outputVideoChannel, outputAudioChannel, ...tie }) => ({
        _id: id,
        ...tie,
        outputChannels: {
          video: outputVideoChannel ?? undefined,
          audio: outputAudioChannel ?? undefined
        }
      }))
    }
  }))

/** Backup parser output. */
export type Import = z.output<typeof Backup>

export type Export = z.input<typeof Backup>
