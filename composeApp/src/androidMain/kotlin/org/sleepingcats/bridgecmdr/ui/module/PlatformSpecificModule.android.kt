@file:OptIn(ExperimentalUuidApi::class)

package org.sleepingcats.bridgecmdr.ui.module

import android.content.Context
import androidx.datastore.core.handlers.ReplaceFileCorruptionHandler
import androidx.datastore.preferences.core.PreferenceDataStoreFactory
import androidx.datastore.preferences.core.emptyPreferences
import org.koin.core.module.dsl.singleOf
import org.koin.core.module.dsl.viewModelOf
import org.koin.dsl.bind
import org.koin.dsl.binds
import org.koin.dsl.module
import org.sleepingcats.bridgecmdr.Branding
import org.sleepingcats.bridgecmdr.common.security.TokenService
import org.sleepingcats.bridgecmdr.common.service.core.ConnectionService
import org.sleepingcats.bridgecmdr.ui.service.MobileConnectionService
import org.sleepingcats.bridgecmdr.ui.view.model.ApplicationViewModel
import org.sleepingcats.bridgecmdr.ui.view.model.DashboardViewModel
import org.sleepingcats.bridgecmdr.ui.view.model.MobileDashboardViewModel
import org.sleepingcats.bridgecmdr.ui.view.model.MobileSettingsViewModel
import org.sleepingcats.core.settings.PreferencesDataStore
import kotlin.uuid.ExperimentalUuidApi

val platformSpecificModule =
  module {
    //
    // Preferences data store
    //

    single {
      PreferencesDataStore(
        PreferenceDataStoreFactory.create(
          corruptionHandler = ReplaceFileCorruptionHandler { emptyPreferences() },
        ) {
          get<Context>().filesDir.resolve("${Branding.qualifiedName}.preferences_pb")
        },
      )
    }

    //
    // Services
    //

    singleOf(::TokenService)
    singleOf(::MobileConnectionService) binds
      arrayOf(
        MobileConnectionService::class,
        ConnectionService::class,
      )

    //
    // View models
    //

    viewModelOf(::ApplicationViewModel)
    viewModelOf(::MobileDashboardViewModel) bind DashboardViewModel::class
    viewModelOf(::MobileSettingsViewModel)
  }
