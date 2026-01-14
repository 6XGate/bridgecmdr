@file:OptIn(ExperimentalUuidApi::class)

package org.sleepingcats.bridgecmdr.server.route

import io.konform.validation.constraints.minimum
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
import io.ktor.server.routing.post
import org.koin.ktor.ext.inject
import org.sleepingcats.bridgecmdr.common.service.TieService
import org.sleepingcats.bridgecmdr.common.service.model.Tie
import org.sleepingcats.bridgecmdr.server.plugin.rules
import kotlin.uuid.ExperimentalUuidApi
import kotlin.uuid.Uuid

@Resource("/ties")
class Ties {
  @Resource("/")
  class Filtered(
    val sourceId: Uuid? = null,
    val deviceId: Uuid? = null,
  )

  @Resource("/{id}")
  class ById(
    val id: Uuid,
  )
}

fun Route.ties() =
  resource<Ties> {
    install(RequestValidation) {
      rules<Tie.Payload> {
        Tie.Payload::inputChannel {
          minimum(1) hint "Input channel must be 1 or greater"
        }

        Tie.Payload::outputVideoChannel ifPresent {
          minimum(1) hint "Video output channel must be 1 or greater"
        }

        Tie.Payload::outputAudioChannel ifPresent {
          minimum(1) hint "Audio output channel must be 1 or greater"
        }
      }

      rules<Tie.Update> {
        Tie.Update::inputChannel ifPresent {
          minimum(1) hint "Input channel must be 1 or greater"
        }

        Tie.Update::outputVideoChannel ifPresent {
          minimum(1) hint "Video output channel must be 1 or greater"
        }

        Tie.Update::outputAudioChannel ifPresent {
          minimum(1) hint "Audio output channel must be 1 or greater"
        }
      }
    }

    val service: TieService by inject()

    get<Ties.Filtered> { params ->
      when {
        params.deviceId != null && params.sourceId != null -> {
          call.respond<List<Tie>>(service.findBySourceAndDeviceId(params.sourceId, params.deviceId))
        }

        params.sourceId != null -> {
          call.respond<List<Tie>>(service.findBySourceId(params.sourceId))
        }

        params.deviceId != null -> {
          call.respond<List<Tie>>(service.findByDeviceId(params.deviceId))
        }

        else -> {
          call.respond<List<Tie>>(service.all())
        }
      }
    }

    get<Ties.ById> { params ->
      call.respond<Tie>(service.findById(params.id))
    }

    post {
      call.respond<Tie>(service.insert(call.receive<Tie.Payload>()))
    }

    put<Ties.ById> { params ->
      call.respond<Tie>(service.updateById(params.id, call.receive<Tie.Payload>()))
    }

    patch<Ties.ById> { params ->
      call.respond<Tie>(service.partialUpdateById(params.id, call.receive<Tie.Update>()))
    }

    delete<Ties.ById> { params ->
      call.respond<Tie>(service.deleteById(params.id))
    }
  }
