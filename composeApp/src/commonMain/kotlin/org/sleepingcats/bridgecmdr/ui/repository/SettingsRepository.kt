@file:OptIn(ExperimentalUuidApi::class)

package org.sleepingcats.bridgecmdr.ui.repository

import androidx.datastore.preferences.core.booleanPreferencesKey
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.intPreferencesKey
import io.github.oshai.kotlinlogging.KLogger
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.last
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.take
import org.sleepingcats.bridgecmdr.common.extension.get
import org.sleepingcats.bridgecmdr.common.extension.jsonPreferencesKey
import org.sleepingcats.bridgecmdr.common.extension.set
import org.sleepingcats.bridgecmdr.common.service.LegacySettingsService
import org.sleepingcats.bridgecmdr.common.setting.AppTheme
import org.sleepingcats.bridgecmdr.common.setting.IconSize
import org.sleepingcats.bridgecmdr.common.setting.PowerOffTaps
import org.sleepingcats.core.settings.PreferencesDataStore
import kotlin.uuid.ExperimentalUuidApi
import kotlin.uuid.Uuid

class SettingsRepository(
  private val legacySettings: LegacySettingsService,
  private val dataStore: PreferencesDataStore,
  private val logger: KLogger,
) {
  data class Data(
    val appTheme: AppTheme,
    val iconSize: IconSize,
    val powerOnDevicesAtStart: Boolean,
    val powerOffTaps: PowerOffTaps,
    val runServer: Boolean,
    val buttonOrder: List<Uuid>,
  )

  private val keys =
    object {
      val firstRunSteps = intPreferencesKey("firstRunSteps")
      val legacyLoaded = booleanPreferencesKey("legacyLoaded")
      val appTheme = jsonPreferencesKey<AppTheme>("appTheme")
      val iconSize = jsonPreferencesKey<IconSize>("iconSize")
      val powerOnDevicesAtStart = booleanPreferencesKey("powerOnDevicesAtStart")
      val powerOffTaps = jsonPreferencesKey<PowerOffTaps>("powerOffTaps")
      val runServer = booleanPreferencesKey("runServer")
      val buttonOrder = jsonPreferencesKey<List<Uuid>>("buttonOrder")
    }

  val data: Flow<Data> =
    dataStore.data.map { preferences ->
      logger.info { "legacyLoaded=${preferences[keys.legacyLoaded]}" }
      logger.info { "appTheme=${preferences[keys.appTheme]}" }
      logger.info { "iconSize=${preferences[keys.iconSize]}" }
      logger.info { "powerOnDevicesAtStart=${preferences[keys.powerOnDevicesAtStart]}" }
      logger.info { "powerOffTaps=${preferences[keys.powerOffTaps]}" }
      logger.info { "runServer=${preferences[keys.runServer]}" }
      logger.info { "buttonOrder=${preferences[keys.buttonOrder]}" }
      Data(
        appTheme = preferences[keys.appTheme] ?: AppTheme.System,
        iconSize = preferences[keys.iconSize] ?: IconSize.Normal,
        powerOnDevicesAtStart = preferences[keys.powerOnDevicesAtStart] ?: false,
        powerOffTaps = preferences[keys.powerOffTaps] ?: PowerOffTaps.Single,
        runServer = preferences[keys.runServer] ?: false,
        buttonOrder = preferences[keys.buttonOrder] ?: emptyList(),
      )
    }

  val firstRunSteps: Flow<Int> =
    dataStore.data.map { preferences ->
      preferences[keys.firstRunSteps] ?: 0
    }

  private val isLegacyLoaded =
    dataStore.data.map { preferences ->
      preferences[keys.legacyLoaded] ?: false
    }

  suspend fun loadLegacySettings() {
    if (isLegacyLoaded.take(1).last()) return
    logger.info { "Importing legacy settings" }
    dataStore.edit { prefs -> prefs[keys.legacyLoaded] = true }
    legacySettings.read()?.let { settings ->
      setAppTheme(settings.colorScheme?.newValue ?: AppTheme.System)
      setIconSize(settings.iconSize?.let { size -> IconSize.entries.find { it.size == size } } ?: IconSize.Normal)
      setPowerOnDevicesAtStart(settings.powerOnDevices ?: false)
      setPowerOffTaps(settings.powerOffWhen?.newValue ?: PowerOffTaps.Single)
      settings.buttonOrder?.let { order -> setButtonOrder(order) }
    }
  }

  suspend fun setAppTheme(newAppTheme: AppTheme) {
    dataStore.edit { preferences ->
      preferences[keys.appTheme] = newAppTheme
    }
  }

  suspend fun setIconSize(newIconSize: IconSize) {
    dataStore.edit { preferences ->
      preferences[keys.iconSize] = newIconSize
    }
  }

  suspend fun setPowerOnDevicesAtStart(powerOn: Boolean) {
    dataStore.edit { preferences ->
      preferences[keys.powerOnDevicesAtStart] = powerOn
    }
  }

  suspend fun setPowerOffTaps(taps: PowerOffTaps) {
    dataStore.edit { preferences ->
      preferences[keys.powerOffTaps] = taps
    }
  }

  suspend fun setRunServer(runServer: Boolean) {
    dataStore.edit { preferences ->
      preferences[keys.runServer] = runServer
    }
  }

  suspend fun setButtonOrder(buttonOrder: List<Uuid>) {
    dataStore.edit { preferences ->
      preferences[keys.buttonOrder] = buttonOrder
    }
  }
}
