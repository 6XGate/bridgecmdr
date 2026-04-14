import { z } from 'zod'
import { ColorScheme, IconSize, PowerOffTaps } from '../../settings'
import { Layouts } from './version1'
import type { Import } from './version4'

/**
 * Settings v2, will be used in Export v2.
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
 * Backup parser for v2.
 */
export const Backup = z
  .object({
    version: z.literal(2),
    settings: Settings,
    layouts: Layouts
  })
  .transform(
    (payload): Import => ({
      version: 'normalized' as const,
      settings: {
        ...payload.settings,
        buttonOrder: payload.layouts.sources.map((source) => source._id)
      },
      layouts: {
        sources: payload.layouts.sources.map((source) => ({ order: 0, ...source })),
        devices: payload.layouts.switches,
        ties: payload.layouts.ties.map(({ switchId, outputChannels, ...tie }) => ({
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
