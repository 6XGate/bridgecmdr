@file:OptIn(ExperimentalUuidApi::class)

package org.sleepingcats.bridgecmdr.ui.module

import coil3.ImageLoader
import coil3.PlatformContext
import coil3.request.crossfade
import coil3.size.Precision
import org.koin.core.module.dsl.singleOf
import org.koin.dsl.module
import org.sleepingcats.bridgecmdr.ui.cache.SourceCache
import org.sleepingcats.bridgecmdr.ui.cache.UserImageCache
import org.sleepingcats.bridgecmdr.ui.repository.SettingsRepository
import org.sleepingcats.bridgecmdr.ui.repository.SourceRepository
import kotlin.uuid.ExperimentalUuidApi

val commonModule =
  module {
    //
    // User image cache
    //

    singleOf(UserImageCache::KeyOf)
    singleOf(UserImageCache::Factory)
    singleOf({ context: PlatformContext, factory: UserImageCache.Factory, keyOf: UserImageCache.KeyOf ->
      ImageLoader
        .Builder(context)
        .components {
          add(keyOf)
          add(factory)
        }.precision(Precision.EXACT)
        .crossfade(true)
        .build()
    })

    //
    // Caches
    //

    singleOf(::SourceCache)

    //
    // Repositories
    //

    singleOf(::SettingsRepository)
    singleOf(::SourceRepository)
  }
