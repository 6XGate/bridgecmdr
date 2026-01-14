@file:OptIn(ExperimentalUuidApi::class)

package org.sleepingcats.bridgecmdr.common.service.remote

import io.ktor.client.call.body
import io.ktor.client.request.delete
import io.ktor.client.request.get
import io.ktor.client.request.parameter
import io.ktor.client.request.patch
import io.ktor.client.request.post
import io.ktor.client.request.put
import io.ktor.client.request.setBody
import org.sleepingcats.bridgecmdr.common.service.TieService
import org.sleepingcats.bridgecmdr.common.service.core.ConnectionService
import org.sleepingcats.bridgecmdr.common.service.model.Tie
import kotlin.uuid.ExperimentalUuidApi
import kotlin.uuid.Uuid

class RemoteTieService(
  private val connection: ConnectionService,
) : TieService {
  override suspend fun all(): List<Tie> =
    connection.watchRequest {
      get("/ties").body()
    }

  override suspend fun findBySourceId(sourceId: Uuid): List<Tie> =
    connection.watchRequest {
      get("/ties") { parameter("sourceId", sourceId) }.body()
    }

  override suspend fun findByDeviceId(deviceId: Uuid): List<Tie> =
    connection.watchRequest {
      get("/ties") { parameter("deviceId", deviceId) }.body()
    }

  override suspend fun findBySourceAndDeviceId(
    sourceId: Uuid,
    deviceId: Uuid,
  ): List<Tie> =
    connection.watchRequest {
      get("/ties") {
        parameter("sourceId", sourceId)
        parameter("deviceId", deviceId)
      }.body()
    }

  override suspend fun findById(id: Uuid): Tie =
    connection.watchRequest {
      get("/ties/$id").body()
    }

  override suspend fun insert(payload: Tie.Payload): Tie =
    connection.watchRequest {
      post("/ties") { setBody(payload) }.body()
    }

  override suspend fun upsert(tie: Tie): Tie = TODO("Upsert is not supported remotely")

  override suspend fun updateById(
    id: Uuid,
    payload: Tie.Payload,
  ): Tie =
    connection.watchRequest {
      put("/ties/$id") { setBody(payload) }.body()
    }

  override suspend fun partialUpdateById(
    id: Uuid,
    payload: Tie.Update,
  ): Tie =
    connection.watchRequest {
      patch("/ties/$id") { setBody(payload) }.body()
    }

  override suspend fun deleteById(id: Uuid): Tie =
    connection.watchRequest {
      delete("/ties/$id").body()
    }
}
