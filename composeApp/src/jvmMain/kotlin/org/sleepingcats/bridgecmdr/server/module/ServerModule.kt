package org.sleepingcats.bridgecmdr.server.module

import kotlinx.coroutines.CoroutineScope
import org.koin.core.module.dsl.singleOf
import org.koin.dsl.bind
import org.koin.dsl.module
import org.sleepingcats.bridgecmdr.common.security.TokenService
import org.sleepingcats.bridgecmdr.server.ServerController

fun serverModule(scope: CoroutineScope) =
  module {
    singleOf(::TokenService)
    single { ServerController(get(), scope) } bind ServerController::class
  }
