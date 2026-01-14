package org.sleepingcats.bridgecmdr.ui.view.model

import androidx.lifecycle.viewModelScope
import bridgecmdr.composeapp.generated.resources.Res
import bridgecmdr.composeapp.generated.resources.fatal_database
import io.github.oshai.kotlinlogging.KLogger
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.catch
import kotlinx.coroutines.flow.last
import kotlinx.coroutines.flow.launchIn
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.onEach
import kotlinx.coroutines.flow.take
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import org.sleepingcats.bridgecmdr.common.service.DatabaseService
import org.sleepingcats.bridgecmdr.common.service.PowerService
import org.sleepingcats.bridgecmdr.server.ServerController
import org.sleepingcats.bridgecmdr.ui.repository.SettingsRepository
import org.sleepingcats.bridgecmdr.ui.service.ApplicationService

class DesktopApplicationViewModel(
  logger: KLogger,
  databaseService: DatabaseService,
  serverController: ServerController,
  applicationService: ApplicationService,
  settingsRepository: SettingsRepository,
  powerService: PowerService,
) : ApplicationViewModel(logger, settingsRepository) {
  init {
    viewModelScope.launch(Dispatchers.Default) {
      // Initialize the database first.
      runCatching { databaseService.initializeDatabase() }
        .onFailure { throwable ->
          logger.error(throwable) { "Failed to initialize database" }
          fatalError.update {
            logger.error(throwable) { "Failed to initialize database" }
            ViewError(Res.string.fatal_database, throwable) {
              applicationService.fatalExit()
            }
          }
        }

      // Load legacy settings.
      settingsRepository.loadLegacySettings()

      // Now it will be possible to initialize the server.
      settingsRepository.data
        .map { it.runServer }
        .onEach { if (it) serverController.start() else serverController.stop() }
        .catch { throwable -> logger.error(throwable) { "Server action failed" } }
        .launchIn(this)
      applicationService.onExit { serverController.stop() }

      // If power-on at start-up is enabled, power on all devices
      val powerOnDevices =
        settingsRepository.data
          .map { it.powerOnDevicesAtStart }
          .take(1)
          .last()
      if (powerOnDevices) {
        powerService.powerOn()
      }

      applicationService.onExit { powerService.powerOff() }
    }
  }
}
