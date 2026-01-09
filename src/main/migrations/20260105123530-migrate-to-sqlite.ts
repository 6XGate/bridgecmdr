// eslint-disable-next-line n/no-unsupported-features/node-builtins -- Backported
import { hash } from 'node:crypto'
import { map } from 'radash'
import { DeviceModel } from '../dao/devices'
import { SourceModel } from '../dao/sources'
import { TieModel } from '../dao/ties'
import { fromUuidString, kyselyMigration, newUuid, toUuidString } from '../repos/database'
import { Database } from '../services/database'
import { useLevelDb } from '../services/level'
import type DatabaseSchema from '../repos/database'
import type { UUID } from 'node:crypto'

export async function migrate() {
  await kyselyMigration<DatabaseSchema>(async function (trx) {
    const { levelup } = useLevelDb()
    const settingsDb = await levelup('_userStorage')
    const sourcesDb = new Database('sources', SourceModel)
    const devicesDb = new Database('devices', DeviceModel)
    const tiesDb = new Database('ties', TieModel)
    try {
      const sourceOrder = new Array<[number, string]>()

      const sources = await map(await sourcesDb.all(), async (sourceDoc) => {
        const imageAttachment = sourceDoc._attachments.find((att) => att.name === sourceDoc.image)
        let image
        if (imageAttachment) {
          image = await trx
            .insertInto('images')
            .values({
              id: newUuid(),
              data: Buffer.from(imageAttachment),
              type: imageAttachment.type,
              hash: hash('sha256', imageAttachment, 'buffer')
            })
            .returning('id')
            .executeTakeFirst()
            .then((r) => r?.id)
        }

        sourceOrder.push([sourceDoc.order, sourceDoc._id.toLowerCase()])

        return await trx
          .insertInto('sources')
          .values({
            id: fromUuidString(sourceDoc._id as UUID),
            title: sourceDoc.title,
            image: image ?? null
          })
          .returningAll()
          .executeTakeFirstOrThrow()
      })

      const buttonOrder = sourceOrder.sort((a, b) => a[0] - b[0]).map(([, id]) => id)

      await trx
        .insertInto('settings')
        .values({ name: 'buttonOrder', value: JSON.stringify(buttonOrder) })
        .execute()

      for await (const [name, value] of settingsDb.iterator()) {
        await trx.insertInto('settings').values({ name, value }).execute()
      }

      const devices = await map(
        await devicesDb.all(),
        async (deviceDoc) =>
          await trx
            .insertInto('devices')
            .values({
              id: fromUuidString(deviceDoc._id as UUID),
              driver_id: fromUuidString(deviceDoc.driverId as UUID),
              name: deviceDoc.title,
              path: deviceDoc.path
            })
            .returningAll()
            .executeTakeFirstOrThrow()
      )

      for (const tieDoc of await tiesDb.all()) {
        const source = sources.find((s) => toUuidString(s.id) === tieDoc.sourceId)
        const device = devices.find((d) => toUuidString(d.id) === tieDoc.deviceId)
        if (!source || !device) continue

        // eslint-disable-next-line no-await-in-loop -- Must be serialized for SQLite
        await trx
          .insertInto('ties')
          .values({
            id: fromUuidString(tieDoc._id as UUID),
            source_id: source.id,
            device_id: device.id,
            input_channel: tieDoc.inputChannel,
            output_video_channel: tieDoc.outputChannels.video ?? null,
            output_audio_channel: tieDoc.outputChannels.audio ?? null
          })
          .execute()
      }
    } finally {
      await settingsDb.close()
      await sourcesDb.close()
      await devicesDb.close()
      await tiesDb.close()
    }
  })
}
