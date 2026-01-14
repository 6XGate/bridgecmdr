@file:OptIn(ExperimentalUuidApi::class)

package org.sleepingcats.bridgecmdr.common.service.local

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.json.Json
import org.jetbrains.exposed.v1.jdbc.transactions.transaction
import org.koin.core.component.KoinComponent
import org.sleepingcats.bridgecmdr.common.service.DatabaseService
import org.sleepingcats.bridgecmdr.common.service.LegacySettingsService
import org.sleepingcats.bridgecmdr.common.service.entity.SettingEntity
import org.sleepingcats.bridgecmdr.common.service.model.LegacySettings
import kotlin.uuid.ExperimentalUuidApi

class LocalLegacySettingsService(
  private val databaseService: DatabaseService,
) : KoinComponent,
  LegacySettingsService {
  override suspend fun read() =
    withContext(Dispatchers.IO) {
      transaction(databaseService.get()) {
        LegacySettings(
          iconSize = SettingEntity.findById("iconSize")?.value?.let { Json.decodeFromString(it) },
          colorScheme = SettingEntity.findById("colorScheme")?.value?.let { Json.decodeFromString(it) },
          powerOffWhen = SettingEntity.findById("powerOffWhen")?.value?.let { Json.decodeFromString(it) },
          powerOnDevices = SettingEntity.findById("powerOnSwitchesAtStart")?.value?.let { Json.decodeFromString(it) },
          buttonOrder = SettingEntity.findById("buttonOrder")?.value?.let { Json.decodeFromString(it) },
        )
      }
    }
}
