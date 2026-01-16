package org.sleepingcats.bridgecmdr.common.module

import org.koin.core.module.dsl.singleOf
import org.koin.dsl.module
import org.sleepingcats.bridgecmdr.common.service.DatabaseService
import org.sleepingcats.bridgecmdr.common.service.migration.MigrationService

var databaseModule =
  module {
    singleOf(::MigrationService)
    singleOf(::DatabaseService)
  }
