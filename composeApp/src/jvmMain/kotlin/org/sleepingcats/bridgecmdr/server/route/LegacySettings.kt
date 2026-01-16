package org.sleepingcats.bridgecmdr.server.route

import io.ktor.server.response.respond
import io.ktor.server.routing.Route
import io.ktor.server.routing.get
import org.koin.ktor.ext.inject
import org.sleepingcats.bridgecmdr.common.service.local.LocalLegacySettingsService

fun Route.settings() {
  val legacySettings by inject<LocalLegacySettingsService>()

  get("/settings") {
    call.respond(legacySettings.read())
  }
}
