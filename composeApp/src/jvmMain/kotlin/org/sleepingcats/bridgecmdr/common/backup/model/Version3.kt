@file:OptIn(ExperimentalUuidApi::class)

package org.sleepingcats.bridgecmdr.common.backup.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import org.sleepingcats.bridgecmdr.common.setting.IconSize
import kotlin.uuid.ExperimentalUuidApi
import kotlin.uuid.Uuid

object Version3 : BackupParser<Version5.Backup> {
  @Serializable
  data class Source(
    @SerialName("_id")
    val id: Uuid,
    val order: Int = 0,
    val title: String,
    val image: String? = null,
  )

  @Serializable
  data class Device(
    @SerialName("_id")
    val id: Uuid,
    val driverId: Uuid,
    val title: String,
    val path: String,
  )

  @Serializable
  data class Tie(
    @SerialName("_id")
    val id: Uuid,
    val sourceId: Uuid,
    val deviceId: Uuid,
    val inputChannel: Int,
    val outputChannels: OutputChannels = OutputChannels(),
  ) {
    @Serializable
    data class OutputChannels(
      val video: Int? = null,
      val audio: Int? = null,
    )
  }

  @Serializable
  data class Layouts(
    val sources: List<Source>,
    val devices: List<Device>,
    val ties: List<Tie>,
  )

  @Serializable
  data class Backup(
    val version: Int,
    val settings: Version2.Settings = Version2.Settings(),
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
          buttonOrder =
            backup.layouts.sources
              .sortedBy { it.order }
              .map { it.id },
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
            backup.layouts.devices.map {
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
                deviceId = it.deviceId,
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
        check(it.version == 3) { "Wrong backup version, expected 3" }
      },
    )
}
