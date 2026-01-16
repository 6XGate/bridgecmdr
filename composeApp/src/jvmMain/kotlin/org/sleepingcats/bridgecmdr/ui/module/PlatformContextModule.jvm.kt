package org.sleepingcats.bridgecmdr.ui.module

import org.koin.dsl.bind
import org.koin.dsl.module

val platformContextModule =
  module {
    // Coil mock platform context for JVM.
    single { coil3.PlatformContext.INSTANCE } bind coil3.PlatformContext::class
  }
