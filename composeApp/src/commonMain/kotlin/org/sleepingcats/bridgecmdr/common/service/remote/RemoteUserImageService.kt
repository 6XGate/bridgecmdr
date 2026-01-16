@file:OptIn(ExperimentalUuidApi::class)

package org.sleepingcats.bridgecmdr.common.service.remote

import io.ktor.client.call.body
import io.ktor.client.request.delete
import io.ktor.client.request.get
import io.ktor.client.request.post
import io.ktor.client.request.setBody
import io.ktor.http.HttpHeaders
import io.ktor.http.headers
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.async
import kotlinx.coroutines.awaitAll
import kotlinx.coroutines.withContext
import org.sleepingcats.bridgecmdr.common.extension.hexDashToUuid
import org.sleepingcats.bridgecmdr.common.service.UserImageService
import org.sleepingcats.bridgecmdr.common.service.core.ConnectionService
import org.sleepingcats.bridgecmdr.common.service.model.UserImage
import kotlin.uuid.ExperimentalUuidApi
import kotlin.uuid.Uuid

class RemoteUserImageService(
  private val connection: ConnectionService,
) : UserImageService {
  override suspend fun all(): List<UserImage> =
    withContext(Dispatchers.IO) {
      connection.watchRequest {
        val ids: List<Uuid> = get("/images").body()
        ids.chunked(4).flatMap { ids ->
          ids.map { id -> async { findById(id) } }.awaitAll()
        }
      }
    }

  override suspend fun findById(id: Uuid): UserImage {
    val response = connection.watchRequest { get("/images/$id") }
    val hash = checkNotNull(response.headers["x-hash"]?.hexToByteArray()) { "Missing x-hash header" }
    val type = checkNotNull(response.headers[HttpHeaders.ContentType]) { "Missing Content-Type header" }
    val data: ByteArray = response.body()

    return UserImage(id, data, type, hash)
  }

  override suspend fun tryFindById(id: Uuid): UserImage? = runCatching { findById(id) }.getOrNull()

  override suspend fun upsert(image: UserImage.New): UserImage {
    val response =
      connection.watchRequest {
        post("/images") {
          setBody(image.data)
          headers { append(HttpHeaders.ContentType, image.type) }
        }
      }

    val id = checkNotNull(response.headers["x-id"]?.hexDashToUuid()) { "Missing x-id header" }
    val hash = checkNotNull(response.headers["x-hash"]?.hexToByteArray()) { "Missing x-hash header" }

    return UserImage(id, image.data, image.type, hash)
  }

  override suspend fun deleteById(id: Uuid): UserImage {
    val response = connection.watchRequest { delete("/images/$id") }

    val hash = checkNotNull(response.headers["x-hash"]?.hexToByteArray()) { "Missing x-hash header" }
    val type = checkNotNull(response.headers[HttpHeaders.ContentType]) { "Missing Content-Type header" }
    val data: ByteArray = response.body()

    return UserImage(id, data, type, hash)
  }
}
