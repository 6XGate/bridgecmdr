@file:OptIn(ExperimentalUuidApi::class)

package org.sleepingcats.bridgecmdr.common.backup.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import org.sleepingcats.bridgecmdr.common.setting.AppTheme
import org.sleepingcats.bridgecmdr.common.setting.IconSize
import kotlin.uuid.ExperimentalUuidApi
import org.sleepingcats.bridgecmdr.common.setting.PowerOffTaps as NewPowerOffTaps

object Version2 : BackupParser<Version5.Backup> {
  @Serializable
  enum class ColorScheme(
    val newValue: AppTheme,
  ) {
    @SerialName("no-preference")
    NoPreference(AppTheme.System),

    @SerialName("light")
    Light(AppTheme.Light),

    @SerialName("dark")
    Dark(AppTheme.Dark),
  }

  @Serializable
  enum class PowerOffTaps(
    val newValue: NewPowerOffTaps,
  ) {
    @SerialName("single")
    Single(NewPowerOffTaps.Single),

    @SerialName("double")
    Double(NewPowerOffTaps.Double),
  }

  @Serializable
  data class Settings(
    val iconSize: Int = 128,
    val colorScheme: ColorScheme = ColorScheme.NoPreference,
    val powerOnSwitchesAtStart: Boolean = false,
    val powerOffWhen: PowerOffTaps = PowerOffTaps.Single,
  )

  @Serializable
  data class Layouts(
    val sources: List<Version1.Source>,
    val switches: List<Version1.Switch>,
    val ties: List<Version1.Tie>,
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
          buttonOrder = backup.layouts.sources.map { it.id },
        ),
      layouts =
        Version4.Layouts(
          sources =
            backup.layouts.sources.map {
              Version4.Source(
                id = it.id,
                title = it.title,
                image = it.image,
              )
            },
          devices =
            backup.layouts.switches.map {
              Version4.Device(
                id = it.id,
                driverId = it.driverId,
                title = it.title,
                path = it.path,
              )
            },
          ties =
            backup.layouts.ties.map {
              Version4.Tie(
                id = it.id,
                sourceId = it.sourceId,
                deviceId = it.switchId,
                inputChannel = it.inputChannel,
                outputVideoChannel = it.outputChannels.video,
                outputAudioChannel = it.outputChannels.audio,
              )
            },
        ),
    )

  override fun parseBackup(raw: String) =
    upgradeBackup(
      Json.decodeFromString<Backup>(raw).also {
        check(it.version == 2) { "Wrong backup version, expected 2" }
      },
    )
}
