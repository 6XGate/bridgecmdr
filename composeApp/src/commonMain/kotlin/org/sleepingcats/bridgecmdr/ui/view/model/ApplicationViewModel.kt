package org.sleepingcats.bridgecmdr.ui.view.model

import androidx.lifecycle.viewModelScope
import io.github.oshai.kotlinlogging.KLogger
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.stateIn
import org.sleepingcats.bridgecmdr.common.setting.AppTheme
import org.sleepingcats.bridgecmdr.ui.repository.SettingsRepository
import org.sleepingcats.bridgecmdr.ui.view.model.core.TrackingViewModel

open class ApplicationViewModel(
  logger: KLogger,
  settingsRepository: SettingsRepository,
) : TrackingViewModel(logger) {
  data class State(
    val error: ViewError? = null,
    val fatalError: ViewError? = null,
    val appTheme: AppTheme = AppTheme.System,
  )

  val state =
    combine(
      error,
      fatalError,
      settingsRepository.data.map { it.appTheme },
      ::State,
    ).stateIn(viewModelScope, SharingStarted.WhileSubscribed(), State())
}
