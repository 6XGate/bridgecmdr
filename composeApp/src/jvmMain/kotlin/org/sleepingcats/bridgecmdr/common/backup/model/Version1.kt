@file:OptIn(ExperimentalUuidApi::class)

package org.sleepingcats.bridgecmdr.common.backup.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import kotlin.uuid.ExperimentalUuidApi
import kotlin.uuid.Uuid

object Version1 : BackupParser<Version5.Backup> {
  @Serializable
  data class Source(
    @SerialName("_id")
    val id: Uuid,
    val title: String,
    val image: String?,
  )

  @Serializable
  data class Switch(
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
    val switchId: Uuid,
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
  data class Backup(
    val version: Int = 1,
    val sources: List<Source>,
    val switches: List<Switch>,
    val ties: List<Tie>,
  )

  fun upgradeBackup(backup: Backup) =
    Version5.Backup(
      version = 5,
      settings =
        Version5.Settings(
          buttonOrder = backup.sources.map { it.id },
        ),
      layouts =
        Version4.Layouts(
          sources =
            backup.sources.map {
              Version4.Source(
                id = it.id,
                title = it.title,
                image = it.image,
              )
            },
          devices =
            backup.switches.map {
              Version4.Device(
                id = it.id,
                driverId = it.driverId,
                title = it.title,
                path = it.path,
              )
            },
          ties =
            backup.ties.map {
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
      Json.decodeFromString<Backup>(raw).also { check(it.version == 1) { "Wrong backup version, expected 1" } },
    )
}
