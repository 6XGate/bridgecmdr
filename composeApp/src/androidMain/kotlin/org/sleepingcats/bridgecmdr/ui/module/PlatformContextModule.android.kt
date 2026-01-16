package org.sleepingcats.bridgecmdr.ui.module

import coil3.PlatformContext
import org.koin.android.ext.koin.androidContext
import org.koin.dsl.bind
import org.koin.dsl.module

val platformContextModule =
  module {
    // Real platform context for Android.
    single { androidContext() } bind PlatformContext::class
  }
