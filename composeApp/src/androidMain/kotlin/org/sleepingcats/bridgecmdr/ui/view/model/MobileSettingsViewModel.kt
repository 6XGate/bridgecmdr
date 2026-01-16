@file:OptIn(ExperimentalCoroutinesApi::class)

package org.sleepingcats.bridgecmdr.ui.view.model

import androidx.lifecycle.viewModelScope
import io.github.oshai.kotlinlogging.KLogger
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.stateIn
import org.sleepingcats.bridgecmdr.common.setting.AppTheme
import org.sleepingcats.bridgecmdr.common.setting.IconSize
import org.sleepingcats.bridgecmdr.ui.repository.SettingsRepository
import org.sleepingcats.bridgecmdr.ui.view.model.core.TrackingViewModel

class MobileSettingsViewModel(
  logger: KLogger,
  private val settings: SettingsRepository,
) : TrackingViewModel(logger) {
  data class State(
    val isLoading: Boolean = false,
    val appTheme: AppTheme = AppTheme.System,
    val iconSize: IconSize = IconSize.Normal,
  )

  val state =
    settings.data
      .map {
        State(
          appTheme = it.appTheme,
          iconSize = it.iconSize,
        )
      }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(), State())

  suspend fun setAppTheme(newAppTheme: AppTheme) = loadingWhile { settings.setAppTheme(newAppTheme) }

  suspend fun setIconSize(newIconSize: IconSize) = loadingWhile { settings.setIconSize(newIconSize) }
}
