package org.sleepingcats.bridgecmdr.common.service.remote

import io.ktor.client.call.body
import io.ktor.client.request.get
import org.sleepingcats.bridgecmdr.common.service.SerialPortService
import org.sleepingcats.bridgecmdr.common.service.core.ConnectionService
import org.sleepingcats.bridgecmdr.common.service.model.PortInfo

class RemoteSerialPortService(
  private val connection: ConnectionService,
) : SerialPortService {
  override suspend fun all(): List<PortInfo> =
    connection.watchRequest {
      get("/ports").body()
    }
}
