@file:OptIn(ExperimentalUuidApi::class)

package org.sleepingcats.bridgecmdr.ui.module

import androidx.datastore.core.handlers.ReplaceFileCorruptionHandler
import androidx.datastore.preferences.core.PreferenceDataStoreFactory
import androidx.datastore.preferences.core.emptyPreferences
import okio.Path.Companion.toOkioPath
import org.koin.core.module.dsl.singleOf
import org.koin.core.module.dsl.viewModelOf
import org.koin.dsl.bind
import org.koin.dsl.module
import org.sleepingcats.bridgecmdr.Branding
import org.sleepingcats.bridgecmdr.Environment
import org.sleepingcats.bridgecmdr.common.backup.Exporter
import org.sleepingcats.bridgecmdr.common.backup.Importer
import org.sleepingcats.bridgecmdr.ui.cache.DeviceCache
import org.sleepingcats.bridgecmdr.ui.cache.DriverCache
import org.sleepingcats.bridgecmdr.ui.cache.PortCache
import org.sleepingcats.bridgecmdr.ui.cache.TieCache
import org.sleepingcats.bridgecmdr.ui.repository.DeviceRepository
import org.sleepingcats.bridgecmdr.ui.repository.DriverRepository
import org.sleepingcats.bridgecmdr.ui.repository.PortRepository
import org.sleepingcats.bridgecmdr.ui.repository.TieRepository
import org.sleepingcats.bridgecmdr.ui.service.ApplicationService
import org.sleepingcats.bridgecmdr.ui.service.SessionService
import org.sleepingcats.bridgecmdr.ui.view.model.ApplicationViewModel
import org.sleepingcats.bridgecmdr.ui.view.model.BackupManagerViewModel
import org.sleepingcats.bridgecmdr.ui.view.model.DashboardViewModel
import org.sleepingcats.bridgecmdr.ui.view.model.DesktopApplicationViewModel
import org.sleepingcats.bridgecmdr.ui.view.model.DesktopDashboardViewModel
import org.sleepingcats.bridgecmdr.ui.view.model.DeviceListViewModel
import org.sleepingcats.bridgecmdr.ui.view.model.EditDeviceViewModel
import org.sleepingcats.bridgecmdr.ui.view.model.EditSourceViewModel
import org.sleepingcats.bridgecmdr.ui.view.model.EditTieViewModel
import org.sleepingcats.bridgecmdr.ui.view.model.GeneralSettingsViewModel
import org.sleepingcats.bridgecmdr.ui.view.model.ServerCodeViewModel
import org.sleepingcats.bridgecmdr.ui.view.model.SettingsViewModel
import org.sleepingcats.bridgecmdr.ui.view.model.SourceListViewModel
import org.sleepingcats.bridgecmdr.ui.view.model.TieListViewModel
import org.sleepingcats.bridgecmdr.ui.view.model.UserImageModel
import org.sleepingcats.core.settings.PreferencesDataStore
import kotlin.io.path.div
import kotlin.uuid.ExperimentalUuidApi
import kotlin.uuid.Uuid

fun platformSpecificModule(exitApplication: (code: Int) -> Unit) =
  module {
    //
    // Preferences data store
    //

    single {
      PreferencesDataStore(
        PreferenceDataStoreFactory.createWithPath(
          corruptionHandler = ReplaceFileCorruptionHandler { emptyPreferences() },
        ) {
          (Environment.directories.user.config / "${Branding.qualifiedName}.preferences_pb").toOkioPath(true)
        },
      )
    }

    //
    // Application and session service
    //

    single { ApplicationService(get(), exitApplication) }
    singleOf(::SessionService)

    //
    // Backup management
    //

    singleOf(::Exporter)
    singleOf(::Importer)

    //
    // Caches
    //

    singleOf(::DriverCache)
    singleOf(::DeviceCache)
    singleOf(::PortCache)
    singleOf(::TieCache)

    //
    // Repositories
    //

    singleOf(::DriverRepository)
    singleOf(::PortRepository)
    singleOf(::DeviceRepository)
    singleOf(::TieRepository)

    //
    // View models
    //

    singleOf(::UserImageModel)
    viewModelOf(::DesktopApplicationViewModel) bind ApplicationViewModel::class
    viewModelOf(::DesktopDashboardViewModel) bind DashboardViewModel::class
    viewModelOf(::ServerCodeViewModel)

    viewModelOf(::SettingsViewModel)
    viewModelOf(::GeneralSettingsViewModel)

    viewModelOf(::DeviceListViewModel)
    factory { (deviceId: Uuid) -> EditDeviceViewModel(deviceId, get(), get(), get(), get()) }

    viewModelOf(::SourceListViewModel)
    factory { (sourceId: Uuid) -> EditSourceViewModel(sourceId, get(), get(), get()) }

    factory { (sourceId: Uuid) -> TieListViewModel(sourceId, get(), get(), get(), get(), get(), get()) }
    factory { (sourceId: Uuid, tieId: Uuid) -> EditTieViewModel(sourceId, tieId, get(), get(), get(), get()) }

    viewModelOf(::BackupManagerViewModel)
  }
