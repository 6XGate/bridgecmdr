@file:OptIn(ExperimentalUuidApi::class)

package org.sleepingcats.bridgecmdr.server.route

import io.ktor.resources.Resource
import io.ktor.server.resources.get
import io.ktor.server.resources.resource
import io.ktor.server.response.respond
import io.ktor.server.routing.Route
import io.ktor.server.routing.get
import org.koin.ktor.ext.inject
import org.sleepingcats.bridgecmdr.common.service.DriverService
import org.sleepingcats.bridgecmdr.common.service.model.Driver
import kotlin.uuid.ExperimentalUuidApi
import kotlin.uuid.Uuid

@Resource("/drivers")
class Drivers {
  @Resource("/{id}")
  class ById(
    val id: Uuid,
  )
}

fun Route.drivers() =
  resource<Drivers> {
    val service: DriverService by inject()

    get {
      call.respond<List<Driver>>(service.all())
    }

    get<Drivers.ById> { params ->
      call.respond<Driver>(service.findById(params.id))
    }
  }
