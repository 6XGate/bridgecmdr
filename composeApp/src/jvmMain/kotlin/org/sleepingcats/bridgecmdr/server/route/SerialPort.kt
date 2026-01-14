package org.sleepingcats.bridgecmdr.server.route

import io.ktor.server.response.respond
import io.ktor.server.routing.Route
import io.ktor.server.routing.get
import io.ktor.server.routing.route
import org.koin.ktor.ext.inject
import org.sleepingcats.bridgecmdr.common.service.SerialPortService
import org.sleepingcats.bridgecmdr.common.service.model.PortInfo

fun Route.serialPorts() {
  route("/ports") {
    val service: SerialPortService by inject()

    get {
      call.respond<List<PortInfo>>(service.all())
    }
  }
}
