package org.sleepingcats.bridgecmdr.ui.view.model

import io.github.oshai.kotlinlogging.KLogger
import org.sleepingcats.bridgecmdr.common.service.core.ConnectionService
import org.sleepingcats.bridgecmdr.ui.repository.SettingsRepository
import org.sleepingcats.bridgecmdr.ui.repository.SourceRepository
import org.sleepingcats.bridgecmdr.ui.service.MobileConnectionService

class MobileDashboardViewModel(
  logger: KLogger,
  baseConnectionService: ConnectionService,
  settingsRepository: SettingsRepository,
  repository: SourceRepository,
) : DashboardViewModel(logger, settingsRepository, repository) {
  private val connectionService = baseConnectionService as MobileConnectionService

  val connected = connectionService.connected
}
