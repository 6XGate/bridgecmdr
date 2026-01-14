package org.sleepingcats.bridgecmdr

import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.window.application
import io.github.oshai.kotlinlogging.KotlinLogging
import io.github.vinceglb.filekit.FileKit
import org.koin.compose.KoinApplication
import org.koin.compose.koinInject
import org.koin.core.logger.Level
import org.koin.dsl.module
import org.koin.logger.SLF4JLogger
import org.sleepingcats.bridgecmdr.common.module.databaseModule
import org.sleepingcats.bridgecmdr.common.module.localServiceModule
import org.sleepingcats.bridgecmdr.server.module.serverModule
import org.sleepingcats.bridgecmdr.ui.MainWindow
import org.sleepingcats.bridgecmdr.ui.module.commonModule
import org.sleepingcats.bridgecmdr.ui.module.platformContextModule
import org.sleepingcats.bridgecmdr.ui.module.platformSpecificModule
import kotlin.system.exitProcess

fun main() {
  // TODO: Localize the app-name here.
  System.setProperty("apple.awt.application.appearance", "system")
  System.setProperty("apple.awt.application.name", Branding.name)
  FileKit.init(
    appId = Branding.applicationId,
    filesDir =
      Environment.directories.user.data
        .toFile(),
    cacheDir =
      Environment.directories.user.cache
        .toFile(),
  )
  application {
    val scope = rememberCoroutineScope()

    fun exitApp(code: Int) {
      when (code) {
        0 -> exitApplication()
        else -> exitProcess(code)
      }
    }

    KoinApplication(application = {
      logger(SLF4JLogger(Level.INFO))
      modules(
        module { single { KotlinLogging.logger(Branding.qualifiedName) } },
        platformContextModule,
        databaseModule,
        localServiceModule,
        serverModule(scope),
        commonModule,
        platformSpecificModule(::exitApp),
      )
    }) {
      MainWindow(koinInject()) { App() }
    }
  }
}
