import { alphabetical, map } from 'radash'
import { z } from 'zod'
import { Database } from '../../main/services/database'
import useDrivers from '../../main/services/drivers'
import { useLevelDb } from '../../main/services/level'
import type { inferDocumentOf } from '../../main/services/database'
import { Attachment } from '@/attachments'
import { raiseError } from '@/error-handling'

export async function seedForMigration() {
  //
  // Migration database must be clean.
  //

  const migrationDb = await useLevelDb().levelup('_migrations')
  await migrationDb.clear()
  await migrationDb.close()

  //
  // Original, v1, models.
  //

  const DocumentId = z
    .string()
    .uuid()
    .transform((value) => value.toUpperCase())

  type Switch = inferDocumentOf<typeof SwitchModel>
  const SwitchModel = z.object({
    driverId: DocumentId,
    title: z.string().min(1),
    path: z.string().min(1)
  })

  type Source = inferDocumentOf<typeof SourceModel>
  const SourceModel = z.object({
    title: z.string().min(1),
    image: z.string().min(1).nullable()
  })

  type Tie = inferDocumentOf<typeof TieModel>
  const TieModel = z.object({
    sourceId: DocumentId,
    switchId: DocumentId,
    inputChannel: z.number().int().nonnegative(),
    outputChannels: z.object({
      video: z.number().int().nonnegative().optional(),
      audio: z.number().int().nonnegative().optional()
    })
  })

  //
  // Original, v1 databases.
  //
  // These should be closed once seeded.

  const switchesDb = new Database('switches', SwitchModel)
  const sourcesDb = new Database('sources', SourceModel)
  const tiesDb = new Database('ties', TieModel)

  await switchesDb.clear()
  await sourcesDb.clear()
  await tiesDb.clear()

  //
  // Intermediate databases.
  //
  // When other databases that could exist that become
  // intermediaries to the current.
  //
  // These should be closed once cleared.

  //
  // Current databases
  //
  // These should be closed once cleaned.

  const UnknownModel = z.object({})

  const devicesDb = new Database('devices', UnknownModel)

  await devicesDb.clear()
  await devicesDb.close()

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
    async (doc) => await switchesDb.add(doc)
  )) as [Switch, Switch, Switch]

  const file = new File([Buffer.from('test')], 'test.txt', { type: 'text/plain' })
  const image = await Attachment.fromFile(file)

  const sources = (await map(
    [
      { title: 'NES', image: image.name },
      { title: 'SNES', image: image.name },
      { title: 'N64', image: image.name }
    ],
    async (doc) => await sourcesDb.add(doc, image)
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
    async (doc) => await tiesDb.add(doc)
  )) as [Tie, Tie, Tie, Tie, Tie, Tie]

  await switchesDb.close()
  await sourcesDb.close()
  await tiesDb.close()

  return {
    // Drivers
    extronSis,
    sonyRemote,
    // Added documents
    switches: alphabetical(switches, (item) => item._id) as typeof switches,
    sources: alphabetical(sources, (item) => item._id) as typeof sources,
    ties: alphabetical(ties, (item) => item._id) as typeof ties
  }
}
