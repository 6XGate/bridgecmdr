package org.sleepingcats.bridgecmdr.server

import bridgecmdr.composeapp.generated.resources.Res
import bridgecmdr.composeapp.generated.resources.server_ServerStatus_Running
import bridgecmdr.composeapp.generated.resources.server_ServerStatus_Starting
import bridgecmdr.composeapp.generated.resources.server_ServerStatus_Stopped
import bridgecmdr.composeapp.generated.resources.server_ServerStatus_Stopping
import org.jetbrains.compose.resources.StringResource
import org.sleepingcats.bridgecmdr.server.security.ServerContext

sealed interface ServerStatus {
  object Stopped : ServerStatus {
    override val resource = Res.string.server_ServerStatus_Stopped
  }

  object Starting : ServerStatus {
    override val resource = Res.string.server_ServerStatus_Starting
  }

  class Running(
    context: ServerContext,
  ) : ServerStatus {
    override val resource = Res.string.server_ServerStatus_Running
    val url = "https://${context.serverAddress}:${context.port}"
    val tokenSecret = context.tokenSecret
    val publicKey = context.publicKey
  }

  object Stopping : ServerStatus {
    override val resource = Res.string.server_ServerStatus_Stopping
  }

  val resource: StringResource
}
