package org.sleepingcats.bridgecmdr.common.service.migration

import io.github.oshai.kotlinlogging.KLogger
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.runBlocking
import kotlinx.coroutines.withContext
import org.jetbrains.exposed.v1.core.Table
import org.jetbrains.exposed.v1.jdbc.Database
import org.jetbrains.exposed.v1.jdbc.SchemaUtils
import org.jetbrains.exposed.v1.jdbc.insert
import org.jetbrains.exposed.v1.jdbc.selectAll
import org.jetbrains.exposed.v1.jdbc.transactions.transaction
import org.koin.core.component.KoinComponent
import org.sleepingcats.bridgecmdr.common.service.migration.script.M20260105123500CreateSqliteTables
import org.sleepingcats.bridgecmdr.common.service.migration.script.M20260105123530MigrateToSqlite
import java.time.ZoneOffset.UTC
import java.time.ZonedDateTime
import java.time.format.DateTimeFormatter.ISO_INSTANT
import kotlin.system.measureTimeMillis
import kotlin.time.Duration.Companion.seconds

class MigrationService(
  private val logger: KLogger,
) : KoinComponent {
  private object MigrationTable : Table("bridgecmdr_migrations") {
    val name = text("name")
    override val primaryKey = PrimaryKey(name)
    val date = text("date")
  }

  private val migrations =
    listOf(
      M20260105123500CreateSqliteTables,
      M20260105123530MigrateToSqlite,
    )

  suspend fun runMigrations(db: Database) {
    withContext(Dispatchers.IO) {
      transaction(db) {
        SchemaUtils.create(MigrationTable)
      }
    }

    val executed =
      withContext(Dispatchers.IO) {
        transaction(db) {
          MigrationTable.selectAll().map { it[MigrationTable.name] }
        }
      }

    for (migration in migrations) {
      if (executed.contains(migration.name)) continue

      withContext(Dispatchers.IO) {
        runCatching {
          transaction(db) {
            runBlocking {
              logger.debug { "Running migration: ${migration.name}" }
              val time = measureTimeMillis { migration.up(db, logger) }
              logger.info { "Migration applied: ${migration.name}, in ${time.seconds}" }
              val checked =
                MigrationTable
                  .insert {
                    it[name] = migration.name
                    it[date] = ZonedDateTime.now(UTC).format(ISO_INSTANT)
                  }.insertedCount
              if (checked != 1) {
                throw IllegalStateException("Failed to record migration: ${migration.name}")
              }
            }
          }
        }.onFailure {
          logger.error(it) { "Failed to apply migration: ${migration.name}" }
          throw it
        }
      }
    }
  }
}
