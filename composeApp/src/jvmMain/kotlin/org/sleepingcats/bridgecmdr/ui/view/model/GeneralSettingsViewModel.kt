@file:OptIn(ExperimentalCoroutinesApi::class)

package org.sleepingcats.bridgecmdr.ui.view.model

import androidx.lifecycle.viewModelScope
import io.github.oshai.kotlinlogging.KLogger
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import org.sleepingcats.bridgecmdr.common.setting.AppTheme
import org.sleepingcats.bridgecmdr.common.setting.IconSize
import org.sleepingcats.bridgecmdr.common.setting.PowerOffTaps
import org.sleepingcats.bridgecmdr.server.ServerController
import org.sleepingcats.bridgecmdr.server.ServerStatus
import org.sleepingcats.bridgecmdr.ui.repository.SettingsRepository
import org.sleepingcats.bridgecmdr.ui.service.ApplicationService
import org.sleepingcats.bridgecmdr.ui.view.model.core.TrackingViewModel

class GeneralSettingsViewModel(
  logger: KLogger,
  private val settings: SettingsRepository,
  private val applicationService: ApplicationService,
  controller: ServerController,
) : TrackingViewModel(logger) {
  data class State(
    val isLoading: Boolean = false,
    val autoRun: Boolean = false,
    val appTheme: AppTheme = AppTheme.System,
    val iconSize: IconSize = IconSize.Normal,
    val powerOnDevicesAtStart: Boolean = false,
    val powerOffTaps: PowerOffTaps = PowerOffTaps.Single,
    val runServer: Boolean = false,
    val serverStatus: ServerStatus = ServerStatus.Stopped,
  )

  val autoRun = applicationService.checkAutoRunIn(viewModelScope)

  val state =
    combine(
      autoRun,
      settings.data,
      controller.status,
    ) { autoRun, settingsData, serverStatus ->
      State(
        autoRun = autoRun,
        appTheme = settingsData.appTheme,
        iconSize = settingsData.iconSize,
        powerOnDevicesAtStart = settingsData.powerOnDevicesAtStart,
        powerOffTaps = settingsData.powerOffTaps,
        runServer = settingsData.runServer,
        serverStatus = serverStatus,
      )
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(), State())

  suspend fun enableAutoRun() = loadingWhile { autoRun.enable() }

  suspend fun disableAutoRun() = loadingWhile { autoRun.disable() }

  suspend fun setAppTheme(newAppTheme: AppTheme) = loadingWhile { settings.setAppTheme(newAppTheme) }

  suspend fun setIconSize(newIconSize: IconSize) = loadingWhile { settings.setIconSize(newIconSize) }

  suspend fun setPowerOnDevicesAtStart(powerOn: Boolean) = loadingWhile { settings.setPowerOnDevicesAtStart(powerOn) }

  suspend fun setPowerOffTaps(taps: PowerOffTaps) = loadingWhile { settings.setPowerOffTaps(taps) }

  suspend fun setRunServer(run: Boolean) = loadingWhile { settings.setRunServer(run) }

  fun exitApplication() {
    viewModelScope.launch { applicationService.quit() }
  }
}
