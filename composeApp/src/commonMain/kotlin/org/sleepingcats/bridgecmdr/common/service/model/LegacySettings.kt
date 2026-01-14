@file:OptIn(ExperimentalSerializationApi::class, ExperimentalUuidApi::class)

package org.sleepingcats.bridgecmdr.common.service.model

import kotlinx.serialization.ExperimentalSerializationApi
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import org.sleepingcats.bridgecmdr.common.setting.AppTheme
import org.sleepingcats.bridgecmdr.common.setting.PowerOffTaps
import kotlin.uuid.ExperimentalUuidApi
import kotlin.uuid.Uuid

@Serializable
data class LegacySettings(
  val iconSize: Int?,
  val colorScheme: LegacyColorScheme?,
  val powerOffWhen: LegacyPowerOffTaps?,
  val powerOnDevices: Boolean?,
  val buttonOrder: List<Uuid>?,
) {
  @Serializable
  enum class LegacyColorScheme(
    val newValue: AppTheme,
  ) {
    @SerialName("light")
    Light(AppTheme.Light),

    @SerialName("dark")
    Dark(AppTheme.Dark),

    @SerialName("no-preference")
    System(AppTheme.System),
  }

  @Serializable
  enum class LegacyPowerOffTaps(
    val newValue: PowerOffTaps,
  ) {
    @SerialName("single")
    Single(PowerOffTaps.Single),

    @SerialName("double")
    Double(PowerOffTaps.Double),
  }
}
