package org.sleepingcats.bridgecmdr.common.protocol.support

import io.github.oshai.kotlinlogging.KLogger
import kotlinx.coroutines.async
import kotlinx.coroutines.coroutineScope
import kotlinx.coroutines.withTimeout
import org.koin.core.component.KoinComponent
import org.koin.core.component.inject
import org.sleepingcats.bridgecmdr.common.core.DriverProtocol
import kotlin.getValue

abstract class AbstractDriverProtocol(
  protected val name: String,
) : DriverProtocol,
  KoinComponent {
  companion object {
    /** Timeout for local driver commands, should be shorter than any remote client timeout. */
    private const val TIMEOUT = 2_000L
  }

  protected val logger: KLogger by inject()

  open suspend fun sendPowerOn(uri: String) {
    logger.info { "$name/powerOn; no-op" }
    // Most protocols do not require power on
  }

  open suspend fun sendPowerOff(uri: String) {
    logger.info { "$name/powerOff; no-op" }
    // Most protocols do not require power off
  }

  abstract suspend fun sendActivate(
    uri: String,
    input: Int,
    videoOutput: Int,
    audioOutput: Int,
  )

  final override suspend fun powerOn(uri: String) =
    coroutineScope {
      async {
        runCatching { withTimeout(TIMEOUT) { sendPowerOn(uri) } }
          .onFailure { logger.error(it) { "$name/powerOff: failed to send power on" } }
          .getOrDefault(Unit)
      }
    }

  final override suspend fun powerOff(uri: String) =
    coroutineScope {
      async {
        runCatching { withTimeout(TIMEOUT) { sendPowerOff(uri) } }
          .onFailure { logger.error(it) { "$name/powerOff: failed to send power off" } }
          .getOrDefault(Unit)
      }
    }

  final override suspend fun activate(
    uri: String,
    input: Int,
    videoOutput: Int,
    audioOutput: Int,
  ) = coroutineScope {
    async {
      runCatching { withTimeout(TIMEOUT) { sendActivate(uri, input, videoOutput, audioOutput) } }
        .onFailure { logger.error(it) { "$name/activate: failed to send activate" } }
        .getOrDefault(Unit)
    }
  }
}
