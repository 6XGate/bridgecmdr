package org.sleepingcats.bridgecmdr.common.service.remote

import io.ktor.client.request.post
import org.sleepingcats.bridgecmdr.common.service.PowerService
import org.sleepingcats.bridgecmdr.common.service.core.ConnectionService

class RemotePowerService(
  private val connection: ConnectionService,
) : PowerService {
  override suspend fun powerOn() {
    connection.watchRequest {
      post("/power/on")
    }
  }

  override suspend fun powerOff() {
    connection.watchRequest {
      post("/power/off")
    }
  }
}
