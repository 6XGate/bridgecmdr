@file:OptIn(ExperimentalUuidApi::class)

package org.sleepingcats.bridgecmdr.server.route

import io.konform.validation.constraints.maxLength
import io.konform.validation.constraints.minLength
import io.ktor.http.HttpStatusCode
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
import org.sleepingcats.bridgecmdr.common.service.SourceService
import org.sleepingcats.bridgecmdr.common.service.model.Source
import org.sleepingcats.bridgecmdr.server.plugin.rules
import kotlin.uuid.ExperimentalUuidApi
import kotlin.uuid.Uuid
import io.ktor.server.resources.post as action

@OptIn(ExperimentalUuidApi::class)
@Resource("/sources")
class Sources {
  @Resource("/{id}")
  class ById(
    val id: Uuid,
  ) {
    @Resource("/activate")
    class Activate(
      val parent: ById,
    )
  }
}

fun Route.sources() =
  resource<Sources> {
    install(RequestValidation) {
      rules<Source.Payload> {
        Source.Payload::title {
          minLength(1) hint "Source name may not be empty"
          maxLength(255) hint "Source name may not be longer than 255 characters"
        }
      }
    }

    val service: SourceService by inject()

    get {
      call.respond<List<Source>>(service.all())
    }

    get<Sources.ById> { params ->
      call.respond<Source>(service.findById(params.id))
    }

    post {
      call.respond<Source>(service.insert(call.receive<Source.Payload>()))
    }

    action<Sources.ById.Activate> { params ->
      service.activateById(params.parent.id)
      call.respond(HttpStatusCode.NoContent)
    }

    put<Sources.ById> { params ->
      call.respond<Source>(service.updateById(params.id, call.receive<Source.Payload>()))
    }

    patch<Sources.ById> { params ->
      call.respond<Source>(service.partialUpdateById(params.id, call.receive<Source.Update>()))
    }

    delete<Sources.ById> { params ->
      call.respond<Source>(service.deleteById(params.id))
    }
  }
