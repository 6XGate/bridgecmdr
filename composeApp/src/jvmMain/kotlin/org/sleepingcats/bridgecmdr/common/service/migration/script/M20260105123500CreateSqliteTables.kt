package org.sleepingcats.bridgecmdr.common.service.migration.script

import io.github.oshai.kotlinlogging.KLogger
import org.jetbrains.exposed.v1.core.statements.StatementType.CREATE
import org.jetbrains.exposed.v1.jdbc.Database
import org.jetbrains.exposed.v1.jdbc.transactions.transaction
import org.sleepingcats.bridgecmdr.common.service.migration.Migration

object M20260105123500CreateSqliteTables : Migration {
  override val name: String = "20260105123500-create-sqlite-tables"

  override suspend fun up(
    db: Database,
    logger: KLogger,
  ): Unit =
    transaction(db) {
      // TODO: Remove the settings table in v3.1 or later.
      // It's only here to allow legacy settings migration
      // and later removal without issue.
      exec(
        """
        CREATE TABLE IF NOT EXISTS settings (
          name VARCHAR(255) NOT NULL,
          value TEXT,
          CONSTRAINT settings_pk PRIMARY KEY (name)
        )
        """.trimIndent(),
        explicitStatementType = CREATE,
      ) {
        logger.info { it }
      }
      exec(
        """
        CREATE TABLE IF NOT EXISTS devices (
          id BINARY(16) NOT NULL,
          driver_id BINARY(16) NOT NULL,
          title VARCHAR(255) NOT NULL,
          path VARCHAR(255) NOT NULL,
          CONSTRAINT pk_devices_id PRIMARY KEY (id)
        )
        """.trimIndent(),
        explicitStatementType = CREATE,
      ) { TODO("testing") }
      exec(
        """
        CREATE TABLE IF NOT EXISTS images (
          id BINARY(16) NOT NULL,
          data BLOB NOT NULL,
          type VARCHAR(255) NOT NULL,
          hash BINARY(32) NOT NULL,
          CONSTRAINT pk_images_id PRIMARY KEY (id),
          CONSTRAINT u_images_hash UNIQUE (hash)
        )
        """.trimIndent(),
        explicitStatementType = CREATE,
      )
      exec(
        """
        CREATE TABLE IF NOT EXISTS sources (
          id BINARY(16) NOT NULL,
          title VARCHAR(255) NOT NULL,
          image BINARY(16),
          CONSTRAINT pk_sources_id PRIMARY KEY (id),
          CONSTRAINT fk_sources_image__id FOREIGN KEY (image) REFERENCES images(id) ON DELETE SET NULL ON UPDATE CASCADE
        )
        """.trimIndent(),
        explicitStatementType = CREATE,
      )
      exec(
        """
        CREATE TABLE IF NOT EXISTS ties (
          id BINARY(16) NOT NULL,
          source_id BINARY(16) NOT NULL,
          device_id BINARY(16) NOT NULL,
          input_channel INTEGER NOT NULL,
          output_video_channel INTEGER,
          output_audio_channel INTEGER,
          CONSTRAINT pk_ties_id PRIMARY KEY (id),
          CONSTRAINT fk_ties_device_id__id FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE ON UPDATE CASCADE,
          CONSTRAINT fk_ties_source_id__id FOREIGN KEY (source_id) REFERENCES sources(id) ON DELETE CASCADE ON UPDATE CASCADE,
          CONSTRAINT chk_ties_input_channel_signed_integer CHECK (input_channel BETWEEN -2147483648 AND 2147483647),
          CONSTRAINT chk_ties_output_video_channel_signed_integer CHECK (output_video_channel BETWEEN -2147483648 AND 2147483647),
          CONSTRAINT chk_ties_output_audio_channel_signed_integer CHECK (output_audio_channel BETWEEN -2147483648 AND 2147483647)
        )
        """.trimIndent(),
        explicitStatementType = CREATE,
      )
      exec("CREATE INDEX idx_ties_device_id ON ties (device_id)")
      exec("CREATE INDEX idx_ties_source_id ON ties (source_id)")
    }
}
