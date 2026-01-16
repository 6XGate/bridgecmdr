@file:OptIn(ExperimentalUuidApi::class)

package org.sleepingcats.bridgecmdr.common.service.remote

import io.ktor.client.call.body
import io.ktor.client.request.get
import org.sleepingcats.bridgecmdr.common.service.DriverService
import org.sleepingcats.bridgecmdr.common.service.core.ConnectionService
import org.sleepingcats.bridgecmdr.common.service.model.Driver
import kotlin.uuid.ExperimentalUuidApi
import kotlin.uuid.Uuid

class RemoteDriverService(
  private val connection: ConnectionService,
) : DriverService {
  override suspend fun all(): List<Driver> =
    connection.watchRequest {
      get("/drivers").body()
    }

  override suspend fun findById(id: Uuid): Driver =
    connection.watchRequest {
      get("/drivers/$id").body()
    }
}
