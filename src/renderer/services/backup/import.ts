import { BlobReader, BlobWriter, TextWriter, ZipReader } from '@zip.js/zip.js'
import mime from 'mime'
import { z } from 'zod'
import { toAttachment } from '../../support/files'
import { useDevices } from '../data/devices'
import { useSources } from '../data/sources'
import { useTies } from '../data/ties'
import useDrivers from '../driver'
import useSettings from '../settings'

export async function importSettings(file: File) {
  const settings = useSettings()
  const formats = await Promise.all([
    // HACK: Don't use map to retain the tuple, and type for
    // each element, for z.union, which wants a tuple.
    import('./formats/version1').then((m) => m.Export),
    import('./formats/version2').then((m) => m.Export),
    import('./formats/version3').then((m) => m.Export)
  ])

  const backupSettings = z.union(formats)

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

  const data = backupSettings.parse(JSON.parse(configData))

  settings.iconSize = data.settings?.iconSize ?? settings.iconSize
  settings.colorScheme = data.settings?.colorScheme ?? settings.colorScheme
  settings.powerOnSwitchesAtStart = data.settings?.powerOnSwitchesAtStart ?? settings.powerOnSwitchesAtStart
  settings.powerOffWhen = data.settings?.powerOffWhen ?? settings.powerOffWhen

  const imageCache = new Map<string, File>()

  const drivers = useDrivers()
  await drivers.all()

  const sources = useSources()
  const devices = useDevices()
  const ties = useTies()

  await Promise.all([
    Promise.all(
      data.layouts.sources.map(async (item) => {
        if (item.image == null) {
          await sources.upsert(item)
          return
        }

        const type = mime.getType(item.image) ?? 'application/octet-stream'
        let imageAttachment = imageCache.get(item.image)
        if (imageAttachment != null) {
          await sources.upsert(item, await toAttachment(imageAttachment))
          return
        }

        const imageEntry = entries.find((e) => e.filename === item.image)
        if (imageEntry?.getData == null) {
          // It's not fatal if the image is missing.
          console.warn(`Image for ${item._id}, "${item.image}", is missing`)
          await sources.upsert({ ...item, image: null })
          return
        }

        const imageFile = new BlobWriter()
        await imageEntry.getData(imageFile)
        const imageData = await imageFile.getData()
        imageAttachment = new File([imageData], item.image, { type })
        imageCache.set(item.image, imageAttachment)
        await sources.upsert(item, await toAttachment(imageAttachment))
      })
    ),
    Promise.all(
      data.layouts.devices.map(async (device) => {
        const driver = drivers.items.find((d) => d.guid === device.driverId)
        // Non-fatally skip devices from drivers that don't exist.
        if (driver == null) {
          console.warn(`Driver for ${device.title} no longer support; ${device.driverId}`)
          return
        }

        await devices.upsert(device)
      })
    )
  ])

  await Promise.all(
    data.layouts.ties.map(async (item) => {
      const source = sources.items.find((s) => s._id === item.sourceId)
      const device = devices.items.find((d) => d._id === item.deviceId)
      // Non-fatally skip ties that reference missing devices or sources.
      if (source == null) {
        console.warn(`Source for tie no longer present; ${item.sourceId}`)
        return
      }

      if (device == null) {
        console.warn(`Device for tie no longer present; ${item.deviceId}`)
        return
      }

      await ties.upsert(item)
    })
  )
}
