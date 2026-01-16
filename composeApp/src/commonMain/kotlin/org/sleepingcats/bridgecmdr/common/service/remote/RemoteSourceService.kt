@file:OptIn(ExperimentalUuidApi::class)

package org.sleepingcats.bridgecmdr.common.service.remote

import io.ktor.client.call.body
import io.ktor.client.request.delete
import io.ktor.client.request.get
import io.ktor.client.request.patch
import io.ktor.client.request.post
import io.ktor.client.request.put
import io.ktor.client.request.setBody
import org.sleepingcats.bridgecmdr.common.service.SourceService
import org.sleepingcats.bridgecmdr.common.service.core.ConnectionService
import org.sleepingcats.bridgecmdr.common.service.model.Source
import kotlin.uuid.ExperimentalUuidApi
import kotlin.uuid.Uuid

class RemoteSourceService(
  private val connection: ConnectionService,
) : SourceService {
  override suspend fun all(): List<Source> =
    connection.watchRequest {
      get("/sources").body()
    }

  override suspend fun findById(id: Uuid): Source =
    connection.watchRequest {
      get("/sources/$id").body()
    }

  override suspend fun insert(payload: Source.Payload): Source =
    connection.watchRequest {
      post("/sources") { setBody(payload) }.body()
    }

  override suspend fun upsert(source: Source): Source = TODO("Upsert is not supported remotely")

  override suspend fun updateById(
    id: Uuid,
    payload: Source.Payload,
  ): Source =
    connection.watchRequest {
      put("/sources/$id") { setBody(payload) }.body()
    }

  override suspend fun partialUpdateById(
    id: Uuid,
    payload: Source.Update,
  ): Source =
    connection.watchRequest {
      patch("/sources/$id") { setBody(payload) }.body()
    }

  override suspend fun deleteById(id: Uuid): Source =
    connection.watchRequest {
      delete("/sources/$id").body()
    }

  override suspend fun activateById(id: Uuid) =
    connection.watchRequest {
      post("/sources/$id/activate").let { }
    }
}
