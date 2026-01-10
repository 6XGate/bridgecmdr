// eslint-disable-next-line n/no-unsupported-features/node-builtins -- Backported
import { hash } from 'node:crypto'
import { defer, map } from 'radash'
import { DeviceModel } from '../../dao/devices'
import { SourceModel } from '../../dao/sources'
import { TieModel } from '../../dao/ties'
import { fromUuidString, newUuid, toUuidString } from '../../repos/database'
import { Database } from '../../services/database'
import { useLevelDb } from '../../services/level'
import type DatabaseSchema from '../../repos/database'
import type { Kysely } from 'kysely'
import type { UUID } from 'node:crypto'
import type { MigrationParams } from 'umzug'

export async function up({ context }: MigrationParams<Kysely<DatabaseSchema>>) {
  await defer(async function migrateToSqlite(cleanup) {
    const { levelup } = useLevelDb()

    const settingsDb = await levelup('_userStorage')
    cleanup(async () => {
      await settingsDb.close()
    })

    const sourcesDb = new Database('sources', SourceModel)
    cleanup(async () => {
      await sourcesDb.close()
    })

    const devicesDb = new Database('devices', DeviceModel)
    cleanup(async () => {
      await devicesDb.close()
    })

    const tiesDb = new Database('ties', TieModel)
    cleanup(async () => {
      await tiesDb.close()
    })

    const sourceOrder = new Array<[number, string]>()

    const sources = await map(await sourcesDb.all(), async (sourceDoc) => {
      const imageAttachment = sourceDoc._attachments.find((att) => att.name === sourceDoc.image)
      let image
      if (imageAttachment) {
        image = await context
          .insertInto('images')
          // On conflict, something has to be updated to get a return value.
          .onConflict((query) => query.doUpdateSet({ type: imageAttachment.type }))
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

      sourceOrder.push([sourceDoc.order, sourceDoc._id])

      return await context
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

    await context
      .insertInto('settings')
      .onConflict((query) => query.doUpdateSet({ value: JSON.stringify(buttonOrder) }))
      .values({ name: 'buttonOrder', value: JSON.stringify(buttonOrder) })
      .execute()

    for await (const [name, value] of settingsDb.iterator({ keyAsBuffer: false, valueAsBuffer: false })) {
      await context
        .insertInto('settings')
        .onConflict((query) => query.doUpdateSet({ value }))
        .values({ name, value })
        .execute()
    }

    const devices = await map(
      await devicesDb.all(),
      async (deviceDoc) =>
        await context
          .insertInto('devices')
          .values({
            id: fromUuidString(deviceDoc._id as UUID),
            driver_id: fromUuidString(deviceDoc.driverId as UUID),
            title: deviceDoc.title,
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
      await context
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
  })
}
