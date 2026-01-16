package org.sleepingcats.bridgecmdr.ui.service

import io.github.oshai.kotlinlogging.KLogger
import org.freedesktop.dbus.connections.impl.DBusConnectionBuilder
import org.sleepingcats.bridgecmdr.common.isDevelopment
import org.sleepingcats.bridgecmdr.ui.service.dbus.SessionManager
import org.sleepingcats.core.Platform

class SessionService(
  private val logger: KLogger,
) {
  private val useDbus: Boolean by lazy {
    DBusConnectionBuilder.forSystemBus().build().use { connection ->
      runCatching {
        connection
          .getRemoteObject(
            "org.freedesktop.login1",
            "/org/freedesktop/login1",
            SessionManager::class.java,
          ).canPowerOff() == "yes"
      }.onFailure { throwable -> logger.error(throwable) { "D-Bus is not available for shutdown operations." } }
        .getOrElse { false }
    }
  }

  fun shutdownSystem() {
    // Only support power-off on POSIX systems.
    if (!Platform.isPosix) return

    // Don't power-off during development mode.
    if (isDevelopment) return

    if (useDbus) {
      DBusConnectionBuilder.forSystemBus().build().use { connection ->
        val sessionManager =
          connection
            .getRemoteObject(
              "org.freedesktop.login1",
              "/org/freedesktop/login1",
              SessionManager::class.java,
            )

        logger.info { "Shutting down via D-Bus..." }
        sessionManager.powerOff(false)
      }
    } else {
      logger.info { "Shutting down via command line..." }
      Runtime.getRuntime().exec(arrayOf("shutdown", "-h", "now"))
    }
  }
}
