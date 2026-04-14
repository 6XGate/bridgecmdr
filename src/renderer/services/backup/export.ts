import { BlobReader, BlobWriter, TextReader, ZipWriter } from '@zip.js/zip.js'
import { omit, pick, reduce } from 'radash'
import { toFiles } from '../../support/files'
import { useDevices } from '../data/devices'
import { useSources } from '../data/sources'
import { useTies } from '../data/ties'
import useSettings from '../settings'
import type { Export } from './formats/version4'

function mimeTypeToExt(type: string) {
  switch (type) {
    case 'image/png':
      return 'png'
    case 'image/svg+xml':
      return 'svg'
    case 'image/gif':
      return 'gif'
    case 'image/jpg':
    case 'image/jpeg':
      return 'jpg'
    default:
      return 'bin'
  }
}

export async function exportSettings() {
  const settings = useSettings()
  const sources = useSources()
  const devices = useDevices()
  const ties = useTies()

  await sources.all()
  await devices.all()
  await ties.all()

  const zipFile = new BlobWriter()
  const zipWriter = new ZipWriter(zipFile)

  const imageNames = await reduce(
    sources.items,
    async function (imageToName, item) {
      const image = toFiles(item._attachments).find((file) => file.name === item.image)
      if (image == null) return imageToName

      const ext = mimeTypeToExt(image.type)
      const name = `${image.name.toLowerCase()}.${ext}`
      imageToName.set(image.name, name)

      const imageData = new BlobReader(image)
      await zipWriter.add(name, imageData)
      return imageToName
    },
    new Map<string | null, string>()
  )

  const backupPayload: Export = {
    version: 4,
    settings: {
      ...pick(settings, ['iconSize', 'colorScheme', 'powerOnSwitchesAtStart', 'powerOffWhen']),
      buttonOrder: settings.buttonOrder.map((id) => id.toLowerCase())
    },
    layouts: {
      sources: sources.items.map(function translateSource({ _id, image, ...item }) {
        return {
          id: _id.toLowerCase(),
          image: imageNames.get(image) ?? null,
          ...omit(item, ['order', '_attachments', '_rev'])
        }
      }),
      devices: devices.items.map(({ _id, driverId, ...item }) => ({
        id: _id.toLowerCase(),
        driverId: driverId.toLowerCase(),
        ...omit(item, ['_attachments', '_rev'])
      })),
      ties: ties.items.map(({ _id, sourceId, deviceId, outputChannels, ...item }) => ({
        id: _id.toLowerCase(),
        sourceId: sourceId.toLowerCase(),
        deviceId: deviceId.toLowerCase(),
        outputVideoChannel: outputChannels.video ?? null,
        outputAudioChannel: outputChannels.audio ?? null,
        ...omit(item, ['_attachments', '_rev'])
      }))
    }
  }

  const configText = new TextReader(JSON.stringify(backupPayload))

  await zipWriter.add('config.json', configText)

  return new File([await zipWriter.close()], 'BridgeCmdr.config.zip')
}
