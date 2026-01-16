package org.sleepingcats.bridgecmdr.common.service

import io.github.oshai.kotlinlogging.KLogger
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.filterNotNull
import kotlinx.coroutines.flow.last
import kotlinx.coroutines.flow.take
import kotlinx.coroutines.flow.update
import org.jetbrains.exposed.v1.jdbc.Database
import org.sleepingcats.bridgecmdr.Environment
import org.sleepingcats.bridgecmdr.common.service.migration.MigrationService
import kotlin.io.path.createDirectories
import kotlin.io.path.div

class DatabaseService(
  private val logger: KLogger,
  private val migrationService: MigrationService,
) {
  private val connection = MutableStateFlow<Database?>(null)

  suspend fun get(): Database = connection.filterNotNull().take(1).last()

  suspend fun initializeDatabase() {
    val databasePath =
      Environment.directories.user.config
        .createDirectories() / "store.sqlite"
    logger.debug { "Database path: $databasePath" }
    val db =
      Database.connect(
        url = "jdbc:sqlite:$databasePath",
        driver = "org.sqlite.JDBC",
      )

    migrationService.runMigrations(db)
    connection.update { db }
  }
}
