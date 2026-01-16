package org.sleepingcats.bridgecmdr.common.service.migration.script

import io.github.oshai.kotlinlogging.KLogger
import org.jetbrains.exposed.v1.jdbc.Database
import org.sleepingcats.bridgecmdr.common.service.migration.Migration

object M20260105123530MigrateToSqlite : Migration {
  override val name: String = "20260105123530-migrate-to-sqlite"

  override suspend fun up(
    db: Database,
    logger: KLogger,
  ) {
    // No-op: Data migration from LevelDB was only doable in v2 since no such up-to-date library
    // exists for Kotlin Multiplatform or Java/Kotlin JVM. This is here to ensure the migration
    // is recorded.
  }
}
