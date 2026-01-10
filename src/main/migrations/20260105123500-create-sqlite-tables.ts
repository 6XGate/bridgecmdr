import { sql } from 'kysely'
import { migration } from '../repos/database'

export async function migrate() {
  await migration(async function (trx) {
    await trx.schema
      .createTable('settings')
      .ifNotExists()
      .addColumn('name', 'varchar(255)', (col) => col.primaryKey())
      .addColumn('value', 'text', (col) => col.notNull())
      .execute()

    await trx.schema
      .createTable('devices')
      .ifNotExists()
      .addColumn('id', 'binary(16)', (col) => col.primaryKey())
      .addColumn('driver_id', 'binary(16)', (col) => col.notNull())
      .addColumn('name', 'varchar(255)', (col) => col.notNull())
      .addColumn('path', 'varchar(255)', (col) => col.notNull())
      .execute()

    await trx.schema
      .createTable('images')
      .ifNotExists()
      .addColumn('id', 'binary(16)', (col) => col.primaryKey())
      .addColumn('data', 'blob', (col) => col.notNull())
      .addColumn('type', 'varchar(255)', (col) => col.notNull())
      .addColumn('hash', 'varbinary(255)', (col) => col.notNull())
      .execute()

    await trx.schema.createIndex('images_hash').ifNotExists().on('images').column('hash').unique().execute()

    await trx.schema
      .createTable('sources')
      .ifNotExists()
      .addColumn('id', 'binary(16)', (col) => col.primaryKey())
      .addColumn('title', 'varchar(255)', (col) => col.notNull())
      .addColumn('image', 'binary(16)')
      .addForeignKeyConstraint('fk_sources_image__id', ['image'], 'images', ['id'])
      .execute()

    await trx.schema
      .createTable('ties')
      .ifNotExists()
      .addColumn('id', 'binary(16)', (col) => col.primaryKey())
      .addColumn('source_id', 'binary(16)', (col) => col.notNull())
      .addColumn('device_id', 'binary(16)', (col) => col.notNull())
      .addColumn('input_channel', 'integer', (col) => col.notNull())
      .addColumn('output_video_channel', 'integer')
      .addColumn('output_audio_channel', 'integer')
      .addForeignKeyConstraint('fk_ties_device_id__id', ['device_id'], 'devices', ['id'])
      .addForeignKeyConstraint('fk_ties_source_id__id', ['source_id'], 'sources', ['id'])
      .addCheckConstraint(
        'chk_ties_signed_integer_input_channel',
        sql`input_channel BETWEEN -2147483648 AND 2147483647`
      )
      .addCheckConstraint(
        'chk_ties_signed_integer_output_video_channel',
        sql`output_video_channel BETWEEN -2147483648 AND 2147483647`
      )
      .addCheckConstraint(
        'chk_ties_signed_integer_output_audio_channel',
        sql`output_audio_channel BETWEEN -2147483648 AND 2147483647`
      )
      .execute()
  })
}
