package org.sleepingcats.bridgecmdr.server.route

import io.ktor.http.HttpStatusCode
import io.ktor.server.response.respond
import io.ktor.server.routing.Route
import io.ktor.server.routing.post
import io.ktor.server.routing.route
import org.koin.ktor.ext.inject
import org.sleepingcats.bridgecmdr.common.service.PowerService

fun Route.power() =
  route("/power") {
    val service: PowerService by inject()

    post("/off") {
      service.powerOff()
      call.respond(HttpStatusCode.NoContent)
    }

    post("/on") {
      service.powerOn()
      call.respond(HttpStatusCode.NoContent)
    }
  }
