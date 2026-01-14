package org.sleepingcats.bridgecmdr.common.service.migration

import io.github.oshai.kotlinlogging.KLogger
import org.jetbrains.exposed.v1.jdbc.Database

interface Migration {
  val name: String

  suspend fun up(
    db: Database,
    logger: KLogger,
  )
}
