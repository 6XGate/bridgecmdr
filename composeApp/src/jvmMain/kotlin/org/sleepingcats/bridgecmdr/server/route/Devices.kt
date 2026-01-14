@file:OptIn(ExperimentalUuidApi::class)

package org.sleepingcats.bridgecmdr.server.route

import io.konform.validation.constraints.maxLength
import io.konform.validation.constraints.minLength
import io.ktor.resources.Resource
import io.ktor.server.plugins.requestvalidation.RequestValidation
import io.ktor.server.request.receive
import io.ktor.server.resources.delete
import io.ktor.server.resources.get
import io.ktor.server.resources.patch
import io.ktor.server.resources.put
import io.ktor.server.resources.resource
import io.ktor.server.response.respond
import io.ktor.server.routing.Route
import io.ktor.server.routing.get
import io.ktor.server.routing.post
import org.koin.ktor.ext.inject
import org.sleepingcats.bridgecmdr.common.service.DeviceService
import org.sleepingcats.bridgecmdr.common.service.model.Device
import org.sleepingcats.bridgecmdr.server.plugin.rules
import kotlin.uuid.ExperimentalUuidApi
import kotlin.uuid.Uuid

@Resource("/devices")
class Devices {
  @Resource("/{id}")
  class ById(
    val id: Uuid,
  )
}

fun Route.devices() =
  resource<Devices> {
    install(RequestValidation) {
      rules<Device.Payload> {
        Device.Payload::title {
          minLength(1) hint "Device name may not be empty"
          maxLength(255) hint "Device name may not be longer than 255 characters"
        }

        Device.Payload::path {
          // TODO: Pattern based validation of the path (from JS version)
          minLength(1) hint "Device path may not be empty"
          maxLength(255) hint "Device path may not be longer than 255 characters"
        }
      }
    }

    val service: DeviceService by inject()

    get {
      call.respond<List<Device>>(service.all())
    }

    get<Devices.ById> { params ->
      call.respond<Device>(service.findById(params.id))
    }

    post {
      call.respond<Device>(service.insert(call.receive<Device.Payload>()))
    }

    put<Devices.ById> { params ->
      call.respond<Device>(service.updateById(params.id, call.receive<Device.Payload>()))
    }

    patch<Devices.ById> { params ->
      call.respond<Device>(service.partialUpdateById(params.id, call.receive<Device.Update>()))
    }

    delete<Devices.ById> { params ->
      call.respond<Device>(service.deleteById(params.id))
    }
  }
