@file:OptIn(ExperimentalUuidApi::class)

package org.sleepingcats.bridgecmdr.common.backup.model

import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import org.sleepingcats.bridgecmdr.common.setting.AppTheme
import org.sleepingcats.bridgecmdr.common.setting.IconSize
import org.sleepingcats.bridgecmdr.common.setting.PowerOffTaps
import kotlin.uuid.ExperimentalUuidApi
import kotlin.uuid.Uuid

object Version5 : BackupParser<Version5.Backup> {
  @Serializable
  data class Settings(
    val appTheme: AppTheme = AppTheme.System,
    val iconSize: IconSize = IconSize.Normal,
    val powerOnDevicesAtStart: Boolean = false,
    val powerOffTaps: PowerOffTaps = PowerOffTaps.Single,
    val buttonOrder: List<Uuid> = emptyList(),
  )

  @Serializable
  data class Backup(
    val version: Int,
    val settings: Settings? = null,
    val layouts: Version4.Layouts,
  )

  override fun parseBackup(raw: String): Backup =
    Json.decodeFromString<Backup>(raw).also {
      check(it.version == 5) { "Wrong backup version, expected 5" }
    }
}
