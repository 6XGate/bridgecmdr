package org.sleepingcats.bridgecmdr

import android.app.Application
import io.github.oshai.kotlinlogging.KotlinLogging
import org.koin.android.ext.koin.androidContext
import org.koin.core.context.startKoin
import org.koin.core.logger.Level
import org.koin.dsl.module
import org.koin.logger.SLF4JLogger
import org.sleepingcats.bridgecmdr.common.module.remoteServiceModule
import org.sleepingcats.bridgecmdr.ui.module.commonModule
import org.sleepingcats.bridgecmdr.ui.module.platformSpecificModule

class MainApplication : Application() {
  override fun onCreate() {
    System.setProperty("kotlin-logging-to-android-native", "true")
    super.onCreate()

    startKoin {
      logger(SLF4JLogger(Level.INFO))
      androidContext(this@MainApplication)
      modules(
        module { single { KotlinLogging.logger(Branding.qualifiedName) } },
        remoteServiceModule,
        commonModule,
        platformSpecificModule,
      )
    }
  }
}
