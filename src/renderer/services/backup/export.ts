import { BlobReader, BlobWriter, TextReader, ZipWriter } from '@zip.js/zip.js'
import { pick } from 'radash'
import { toFiles } from '../../support/files'
import useSettings from '../settings'
import { useSources } from '../sources'
import { useSwitches } from '../switches'
import { useTies } from '../ties'
import { isNotNullish } from '@/basics'

export async function exportSettings() {
  const settings = useSettings()
  const sources = useSources()
  const switches = useSwitches()
  const ties = useTies()

  await sources.all()
  await switches.all()
  await ties.all()

  const zipFile = new BlobWriter()
  const zipWriter = new ZipWriter(zipFile)

  // FIXME: Images should be given unique names rather than
  // relying on the name used in the "source" document.
  // This will prevent any issues where two or more
  // "source" documents share the same image name.

  const configText = new TextReader(
    JSON.stringify({
      version: 2,
      settings: pick(settings, ['iconSize', 'colorScheme', 'powerOnSwitchesAtStart', 'powerOffWhen']),
      layouts: {
        sources: sources.items.map((item) => pick(item, ['_id', 'title', 'image'])),
        switches: switches.items.map((item) => pick(item, ['_id', 'driverId', 'path', 'title'])),
        ties: ties.items.map((item) => pick(item, ['_id', 'sourceId', 'switchId', 'inputChannel', 'outputChannels']))
      }
    })
  )

  await zipWriter.add('config.json', configText)

  const images = sources.items
    .map((item) => toFiles(item._attachments).find((file) => file.name === item.image))
    .filter(isNotNullish)

  for (const image of images) {
    const imageData = new BlobReader(image)
    // eslint-disable-next-line no-await-in-loop -- Must be serial.
    await zipWriter.add(image.name, imageData)
  }

  return new File([await zipWriter.close()], 'BridgeCmdr.config.zip')
}
