package org.sleepingcats.bridgecmdr.ui.view.model

import androidx.lifecycle.viewModelScope
import io.github.oshai.kotlinlogging.KLogger
import kotlinx.coroutines.launch
import org.sleepingcats.bridgecmdr.ui.repository.SettingsRepository
import org.sleepingcats.bridgecmdr.ui.repository.SourceRepository
import org.sleepingcats.bridgecmdr.ui.service.ApplicationService
import org.sleepingcats.bridgecmdr.ui.service.SessionService

class DesktopDashboardViewModel(
  logger: KLogger,
  settingsRepository: SettingsRepository,
  repository: SourceRepository,
  private val applicationService: ApplicationService,
  private val sessionService: SessionService,
) : DashboardViewModel(logger, settingsRepository, repository) {
  fun powerOff() {
    viewModelScope.launch {
      applicationService.quit()
      sessionService.shutdownSystem()
    }
  }
}
