package org.sleepingcats.bridgecmdr.ui.service

import io.github.oshai.kotlinlogging.KLogger
import kotlinx.coroutines.CoroutineScope
import org.sleepingcats.bridgecmdr.ui.service.xdg.AutoStartFlow

class ApplicationService(
  private val logger: KLogger,
  private val exitApplication: (code: Int) -> Unit,
) {
  private val exitActions = mutableListOf<suspend () -> Unit>()

  fun onExit(action: suspend () -> Unit) {
    exitActions.add(action)
  }

  fun checkAutoRunIn(scope: CoroutineScope) = AutoStartFlow(logger, scope)

  suspend fun quit() {
    exitActions.forEach { runCatching { it() }.onFailure { logger.error(it) { "onExit action failure" } } }
    exitApplication(0)
  }

  fun fatalExit(): Nothing {
    exitApplication(255)
    throw IllegalStateException("Unreachable code after fatalExit")
  }
}
