import { alphabetical, map } from 'radash'
import useSourcesDatabase from '../../main/dao/sources'
import useSwitchesDatabase from '../../main/dao/switches'
import useTiesDatabase from '../../main/dao/ties'
import useDrivers from '../../main/services/drivers'
import type { Source } from '../../main/dao/sources'
import type { Switch } from '../../main/dao/switches'
import type { Tie } from '../../main/dao/ties'
import { Attachment } from '@/attachments'
import { raiseError } from '@/error-handling'

export async function seedDatabase() {
  const switchDao = useSwitchesDatabase()
  const sourceDao = useSourcesDatabase()
  const tieDao = useTiesDatabase()

  await switchDao.clear()
  await sourceDao.clear()
  await tieDao.clear()

  const drivers = await useDrivers().registered()
  const extronSis =
    drivers.find((driver) => driver.guid === '4C8F2838-C91D-431E-84DD-3666D14A6E2C') ??
    raiseError(() => new ReferenceError('Extron SIS driver not registered'))
  const sonyRemote =
    drivers.find((driver) => driver.guid === '8626D6D3-C211-4D21-B5CC-F5E3B50D9FF0') ??
    raiseError(() => new ReferenceError('Sony RS485 driver not registered'))

  const switches = (await map(
    [
      { title: 'Extron RGBHVA 128plus', driverId: extronSis.guid, path: 'port:/dev/ttys0' },
      { title: 'Extron HDMI 84pro', driverId: extronSis.guid, path: 'ip:192.168.10.2' },
      { title: 'Sony BVM24D', driverId: sonyRemote.guid, path: 'port:/dev/ttys1' }
    ],
    async (doc) => await switchDao.add(doc)
  )) as [Switch, Switch, Switch]

  const file = new File([Buffer.from('test')], 'test.txt', { type: 'text/plain' })
  const image = await Attachment.fromFile(file)

  const sources = (await map(
    [
      { title: 'NES', image: image.name },
      { title: 'SNES', image: image.name },
      { title: 'N64', image: image.name }
    ],
    async (doc) => await sourceDao.add(doc, image)
  )) as [Source, Source, Source]

  const ties = (await map(
    [
      // NES
      { sourceId: sources[0]._id, switchId: switches[0]._id, inputChannel: 1, outputChannels: { video: 1 } },
      { sourceId: sources[0]._id, switchId: switches[2]._id, inputChannel: 1, outputChannels: {} },
      // SNES (HDMI FGPA clone)
      { sourceId: sources[1]._id, switchId: switches[1]._id, inputChannel: 1, outputChannels: { video: 1 } },
      { sourceId: sources[1]._id, switchId: switches[2]._id, inputChannel: 2, outputChannels: {} },
      // N64
      { sourceId: sources[2]._id, switchId: switches[0]._id, inputChannel: 2, outputChannels: { video: 1 } },
      { sourceId: sources[2]._id, switchId: switches[2]._id, inputChannel: 1, outputChannels: {} }
    ],
    async (doc) => await tieDao.add(doc)
  )) as [Tie, Tie, Tie, Tie, Tie, Tie]

  return {
    // DAOs
    switchDao,
    sourceDao,
    tieDao,
    // Drivers
    extronSis,
    sonyRemote,
    // Added documents
    switches: alphabetical(switches, (item) => item._id) as typeof switches,
    sources: alphabetical(sources, (item) => item._id) as typeof sources,
    ties: alphabetical(ties, (item) => item._id) as typeof ties
  }
}
