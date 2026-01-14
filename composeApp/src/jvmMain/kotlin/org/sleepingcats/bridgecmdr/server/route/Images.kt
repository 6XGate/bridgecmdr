@file:OptIn(ExperimentalUuidApi::class)

package org.sleepingcats.bridgecmdr.server.route

import io.ktor.http.ContentType
import io.ktor.http.HttpStatusCode
import io.ktor.resources.Resource
import io.ktor.server.request.contentType
import io.ktor.server.request.receiveChannel
import io.ktor.server.resources.delete
import io.ktor.server.resources.get
import io.ktor.server.resources.resource
import io.ktor.server.response.header
import io.ktor.server.response.respond
import io.ktor.server.response.respondBytes
import io.ktor.server.routing.Route
import io.ktor.server.routing.contentType
import io.ktor.server.routing.get
import io.ktor.server.routing.post
import io.ktor.utils.io.ByteReadChannel
import io.ktor.utils.io.toByteArray
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.koin.ktor.ext.inject
import org.sleepingcats.bridgecmdr.common.service.UserImageService
import org.sleepingcats.bridgecmdr.common.service.local.LocalUserImageService
import org.sleepingcats.bridgecmdr.common.service.model.UserImage
import kotlin.uuid.ExperimentalUuidApi
import kotlin.uuid.Uuid

@Resource("/images")
class Images {
  @Resource("/{id}")
  class ById(
    val id: Uuid,
  )
}

fun Route.images() =
  resource<Images> {
    val service: LocalUserImageService by inject()

    get {
      call.respond<List<Uuid>>(service.all().map { it.id })
    }

    get<Images.ById> { params ->
      val image = service.findById(params.id)
      call.response.header("x-id", image.id.toHexDashString())
      call.response.header("x-hash", image.hash.toHexString())
      call.respondBytes(image.data, contentType = ContentType.parse(image.type))
    }

    contentType(ContentType.Image.Any) {
      post {
        val image = service.storeImage(call.receiveChannel(), call.request.contentType().toString())
        call.response.header("x-id", image.id.toHexDashString())
        call.response.header("x-hash", image.hash.toHexString())
        call.respond(HttpStatusCode.Created)
      }
    }

    delete<Images.ById> { params ->
      val image = service.deleteById(params.id)
      call.response.header("x-id", image.id.toHexDashString())
      call.response.header("x-hash", image.hash.toHexString())
      call.respondBytes(image.data, contentType = ContentType.parse(image.type))
    }
  }

private suspend inline fun UserImageService.storeImage(
  channel: ByteReadChannel,
  type: String,
): UserImage =
  withContext(Dispatchers.IO) {
    upsert(UserImage.New(channel.toByteArray(), type))
  }
