import { sql } from 'kysely'
import type { Kysely } from 'kysely'
import type { MigrationParams } from 'umzug'

export async function up({ context }: MigrationParams<Kysely<unknown>>) {
  await context.schema
    .createTable('settings')
    .ifNotExists()
    .addColumn('name', 'varchar(255)', (col) => col.notNull())
    .addColumn('value', 'text', (col) => col.notNull())
    .addPrimaryKeyConstraint('settings_pk', ['name'])
    .execute()

  await context.schema
    .createTable('devices')
    .ifNotExists()
    .addColumn('id', 'binary(16)', (col) => col.notNull())
    .addColumn('driver_id', 'binary(16)', (col) => col.notNull())
    .addColumn('title', 'varchar(255)', (col) => col.notNull())
    .addColumn('path', 'varchar(255)', (col) => col.notNull())
    .addPrimaryKeyConstraint('pk_devices_id', ['id'])
    .execute()

  await context.schema
    .createTable('images')
    .ifNotExists()
    .addColumn('id', 'binary(16)', (col) => col.notNull())
    .addColumn('data', 'blob', (col) => col.notNull())
    .addColumn('type', 'varchar(255)', (col) => col.notNull())
    .addColumn('hash', 'binary(32)', (col) => col.notNull())
    .addPrimaryKeyConstraint('pk_images_id', ['id'])
    .addUniqueConstraint('u_images_hash', ['hash'])
    .execute()

  await context.schema
    .createTable('sources')
    .ifNotExists()
    .addColumn('id', 'binary(16)', (col) => col.notNull())
    .addColumn('title', 'varchar(255)', (col) => col.notNull())
    .addColumn('image', 'binary(16)')
    .addPrimaryKeyConstraint('pk_sources_id', ['id'])
    .addForeignKeyConstraint('fk_sources_image__id', ['image'], 'images', ['id'], (query) =>
      query.onDelete('set null').onUpdate('cascade')
    )
    .execute()

  await context.schema
    .createTable('ties')
    .ifNotExists()
    .addColumn('id', 'binary(16)', (col) => col.notNull())
    .addColumn('source_id', 'binary(16)', (col) => col.notNull())
    .addColumn('device_id', 'binary(16)', (col) => col.notNull())
    .addColumn('input_channel', 'integer', (col) => col.notNull())
    .addColumn('output_video_channel', 'integer')
    .addColumn('output_audio_channel', 'integer')
    .addPrimaryKeyConstraint('pk_ties_id', ['id'])
    .addForeignKeyConstraint('fk_ties_device_id__id', ['device_id'], 'devices', ['id'], (query) =>
      query.onDelete('cascade').onUpdate('cascade')
    )
    .addForeignKeyConstraint('fk_ties_source_id__id', ['source_id'], 'sources', ['id'], (query) =>
      query.onDelete('cascade').onUpdate('cascade')
    )
    .addCheckConstraint('chk_ties_input_channel_signed_integer', sql`input_channel BETWEEN -2147483648 AND 2147483647`)
    .addCheckConstraint(
      'chk_ties_output_video_channel_signed_integer',
      sql`output_video_channel BETWEEN -2147483648 AND 2147483647`
    )
    .addCheckConstraint(
      'chk_ties_output_audio_channel_signed_integer',
      sql`output_audio_channel BETWEEN -2147483648 AND 2147483647`
    )
    .execute()

  await context.schema.createIndex('idx_ties_device_id').on('ties').column('device_id').execute()
  await context.schema.createIndex('idx_ties_source_id').on('ties').column('source_id').execute()
}
