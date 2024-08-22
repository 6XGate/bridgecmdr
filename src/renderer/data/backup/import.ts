import { BlobReader, BlobWriter, TextWriter, ZipReader } from '@zip.js/zip.js'
import mime from 'mime'
import { z } from 'zod'
import useSettings, { ColorScheme, IconSize, PowerOffTaps } from '../../stores/settings'
import { useDrivers } from '../../system/driver'
import { useSources } from '../../system/source'
import { useSwitches } from '../../system/switch'
import { useTies } from '../../system/tie'

const DocHeader = z.object({
  _id: z.string().uuid()
})

const layouts = {
  // Layout v1, used in settings for v1 and v2.
  1: {
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
  }
}

type V2 = z.output<typeof V2>
const V2 = z.object({
  version: z.literal(2),
  settings: z
    .object({
      iconSize: IconSize.optional(),
      colorScheme: ColorScheme.optional(),
      powerOnSwitchesAtStart: z.boolean().optional(),
      powerOffWhen: PowerOffTaps.optional()
    })
    .optional(),
  layouts: z.object(layouts[1])
})

const V1 = z
  .object({
    version: z.literal(1),
    ...layouts[1]
  })
  .transform(
    ({ sources, switches, ties }) =>
      ({
        version: 2,
        layouts: { sources, switches, ties }
      }) satisfies V2
  )
  .pipe(V2)

export const BackupSettings = z.union([V2, V1])
export type BackupSettings = z.output<typeof BackupSettings>

export const importSettings = async (file: File) => {
  const settings = useSettings()

  const zipFile = new BlobReader(file)
  const zipReader = new ZipReader(zipFile)
  const entries = await zipReader.getEntries()
  const configEntry = entries.find((e) => e.filename === 'config.json')
  if (configEntry?.getData == null) {
    throw new TypeError(`${file.name} does not have a configuration file`)
  }

  const configFile = new TextWriter()
  await configEntry.getData(configFile)
  const configData = await configFile.getData()

  const data = BackupSettings.parse(JSON.parse(configData))

  settings.iconSize = data.settings?.iconSize ?? settings.iconSize
  settings.colorScheme = data.settings?.colorScheme ?? settings.colorScheme
  settings.powerOnSwitchesAtStart = data.settings?.powerOnSwitchesAtStart ?? settings.powerOnSwitchesAtStart
  settings.powerOffWhen = data.settings?.powerOffWhen ?? settings.powerOffWhen

  const imageCache = new Map<string, File>()

  const drivers = useDrivers()
  await drivers.all()

  const sources = useSources()
  const switches = useSwitches()
  const ties = useTies()

  await Promise.all([
    Promise.all(
      data.layouts.sources.map(async (item) => {
        if (item.image == null) {
          await sources.add(item)
          return
        }

        const type = mime.getType(item.image) ?? 'application/octet-stream'
        let imageAttachment = imageCache.get(item.image)
        if (imageAttachment != null) {
          await sources.add(item, imageAttachment)
          return
        }

        const imageEntry = entries.find((e) => e.filename === item.image)
        if (imageEntry?.getData == null) {
          // It's not fatal if the image is missing.
          console.warn(`Image for ${item._id}, "${item.image}", is missing`)
          await sources.add({ ...item, image: null })
          return
        }

        const imageFile = new BlobWriter()
        await imageEntry.getData(imageFile)
        const imageData = await imageFile.getData()
        imageAttachment = new File([imageData], item.image, { type })
        imageCache.set(item.image, imageAttachment)
        await sources.add(item, imageAttachment)
      })
    ),
    Promise.all(
      data.layouts.switches.map(async (item) => {
        const driver = drivers.items.find((d) => d.guid === item.driverId)
        // Non-fatally skip switches from drivers that don't exist.
        if (driver == null) {
          console.warn(`Driver for ${item.title} no longer support; ${item.driverId}`)
          return
        }

        await switches.add(item)
      })
    )
  ])

  await Promise.all(
    data.layouts.ties.map(async (item) => {
      const sourceItem = sources.items.find((s) => s._id === item.sourceId)
      const switchItem = switches.items.find((s) => s._id === item.switchId)
      // Non-fatally skip ties that reference missing switches or sources.
      if (sourceItem == null) {
        console.warn(`Switch for tie no longer present; ${item.sourceId}`)
        return
      }

      if (switchItem == null) {
        console.warn(`Switch for tie no longer present; ${item.switchId}`)
        return
      }

      await ties.add(item)
    })
  )
}
