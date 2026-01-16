package org.sleepingcats.bridgecmdr.server

import io.github.oshai.kotlinlogging.KLogger
import io.ktor.server.engine.EmbeddedServer
import io.ktor.server.engine.connector
import io.ktor.server.engine.embeddedServer
import io.ktor.server.engine.sslConnector
import io.ktor.server.netty.Netty
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.catch
import kotlinx.coroutines.flow.launchIn
import kotlinx.coroutines.flow.onEach
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import org.koin.core.component.KoinComponent
import org.koin.ktor.plugin.setKoin
import org.sleepingcats.bridgecmdr.common.isDevelopment
import org.sleepingcats.bridgecmdr.server.ServerStatus.Running
import org.sleepingcats.bridgecmdr.server.ServerStatus.Starting
import org.sleepingcats.bridgecmdr.server.ServerStatus.Stopped
import org.sleepingcats.bridgecmdr.server.ServerStatus.Stopping
import org.sleepingcats.bridgecmdr.server.security.ServerContext

class ServerController(
  private val logger: KLogger,
  scope: CoroutineScope,
) : KoinComponent {
  private enum class Commands {
    None,
    Start,
    Stop,
  }

  private val _status = MutableStateFlow<ServerStatus>(Stopped)

  val status = _status.asStateFlow()

  private val command = MutableStateFlow(Commands.None)

  fun start() {
    command.update { Commands.Start }
  }

  fun stop() {
    command.update { Commands.Stop }
  }

  init {
    scope.launch(Dispatchers.Default) {
      command
        .onEach { action ->
          when (action) {
            Commands.Start -> startServer()
            Commands.Stop -> stopServer()
            Commands.None -> Unit
          }
        }.catch { throwable -> logger.error(throwable) { "Server command failure" } }
        .launchIn(this)
    }
  }

  private var server: EmbeddedServer<*, *>? = null

  private fun createServer(context: ServerContext): EmbeddedServer<*, *> =
    embeddedServer(
      Netty,
      configure = {
        if (isDevelopment) {
          connector {
            host = context.bindAddress
            port = SERVER_PORT
          }
        }

        sslConnector(
          keyStore = context.keyStore,
          keyAlias = "bridgeCmdr",
          keyStorePassword = { context.keyStorePassword.toCharArray() },
          privateKeyPassword = { context.privateKeyPassword.toCharArray() },
        ) {
          host = context.bindAddress
          port = context.port
        }
      },
    ) {
      // Set Koin instance for Ktor, can't use the plugin
      // since we want to use the instance from Compose.
      setKoin(getKoin())
      application(context)
    }

  private suspend fun startServer() {
    if (server != null) return
    logger.info { "Starting server..." }
    _status.update { Starting }

    val context = ServerContext.create()

    server =
      runCatching { createServer(context).start(wait = false) }
        .onFailure { throwable -> logger.error(throwable) { "Failed to start server" } }
        .onFailure { _status.update { Stopped } }
        .onSuccess { _status.update { Running(context) } }
        .getOrNull()
  }

  private fun stopServer() {
    val current = server ?: return
    logger.info { "Stopping server..." }
    _status.update { Stopping }
    server =
      runCatching { current.stop(1000, 5000) }
        .onFailure { throwable -> logger.error(throwable) { "Failed to stop server" } }
        .onSuccess { _status.update { Stopped } }
        .let { null }
  }
}
