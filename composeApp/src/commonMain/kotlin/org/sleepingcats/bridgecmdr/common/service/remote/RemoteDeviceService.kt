@file:OptIn(ExperimentalUuidApi::class)

package org.sleepingcats.bridgecmdr.common.service.remote

import io.ktor.client.call.body
import io.ktor.client.request.delete
import io.ktor.client.request.get
import io.ktor.client.request.patch
import io.ktor.client.request.post
import io.ktor.client.request.put
import io.ktor.client.request.setBody
import org.sleepingcats.bridgecmdr.common.service.DeviceService
import org.sleepingcats.bridgecmdr.common.service.core.ConnectionService
import org.sleepingcats.bridgecmdr.common.service.model.Device
import kotlin.uuid.ExperimentalUuidApi
import kotlin.uuid.Uuid

class RemoteDeviceService(
  private val connection: ConnectionService,
) : DeviceService {
  override suspend fun all(): List<Device> =
    connection.watchRequest {
      get("/devices").body()
    }

  override suspend fun findById(id: Uuid): Device =
    connection.watchRequest {
      get("/devices/$id").body()
    }

  override suspend fun insert(payload: Device.Payload): Device =
    connection.watchRequest {
      post("/devices") { setBody(payload) }.body()
    }

  override suspend fun upsert(device: Device): Device = TODO("Upsert is not supported remotely")

  override suspend fun updateById(
    id: Uuid,
    payload: Device.Payload,
  ): Device =
    connection.watchRequest {
      put("/devices/$id") { setBody(payload) }.body()
    }

  override suspend fun partialUpdateById(
    id: Uuid,
    payload: Device.Update,
  ): Device =
    connection.watchRequest {
      patch("/devices/$id") { setBody(payload) }.body()
    }

  override suspend fun deleteById(id: Uuid): Device =
    connection.watchRequest {
      delete("/devices/$id").body()
    }
}
