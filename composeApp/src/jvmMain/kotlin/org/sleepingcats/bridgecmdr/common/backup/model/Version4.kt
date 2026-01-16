@file:OptIn(ExperimentalUuidApi::class)

package org.sleepingcats.bridgecmdr.common.backup.model

import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import org.sleepingcats.bridgecmdr.common.backup.model.Version2.ColorScheme
import org.sleepingcats.bridgecmdr.common.setting.IconSize
import org.sleepingcats.bridgecmdr.common.setting.PowerOffTaps
import kotlin.uuid.ExperimentalUuidApi
import kotlin.uuid.Uuid

object Version4 : BackupParser<Version5.Backup> {
  @Serializable
  data class Source(
    val id: Uuid,
    val title: String,
    val image: String? = null,
  )

  @Serializable
  data class Device(
    val id: Uuid,
    val driverId: Uuid,
    val title: String,
    val path: String,
  )

  @Serializable
  data class Tie(
    val id: Uuid,
    val sourceId: Uuid,
    val deviceId: Uuid,
    val inputChannel: Int,
    val outputVideoChannel: Int? = 0,
    val outputAudioChannel: Int? = 0,
  )

  @Serializable
  data class Layouts(
    val sources: List<Source>,
    val devices: List<Device>,
    val ties: List<Tie>,
  )

  @Serializable
  data class Settings(
    val iconSize: Int = 128,
    val colorScheme: ColorScheme = ColorScheme.NoPreference,
    val powerOnSwitchesAtStart: Boolean = false,
    val powerOffWhen: Version2.PowerOffTaps = Version2.PowerOffTaps.Single,
    val buttonOrder: List<Uuid> = emptyList(),
  )

  @Serializable
  data class Backup(
    val version: Int,
    val settings: Settings = Settings(),
    val layouts: Layouts,
  )

  fun upgradeBackup(backup: Backup) =
    Version5.Backup(
      version = 5,
      settings =
        Version5.Settings(
          appTheme = backup.settings.colorScheme.newValue,
          iconSize = IconSize.entries.find { entry -> entry.size == backup.settings.iconSize } ?: IconSize.Normal,
          powerOnDevicesAtStart = backup.settings.powerOnSwitchesAtStart,
          powerOffTaps = backup.settings.powerOffWhen.newValue,
          buttonOrder = backup.settings.buttonOrder,
        ),
      layouts = backup.layouts,
    )

  override fun parseBackup(raw: String): Version5.Backup =
    upgradeBackup(
      Json.decodeFromString<Backup>(raw).also {
        check(it.version == 4) { "Wrong backup version, expected 4" }
      },
    )
}
