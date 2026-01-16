@file:OptIn(ExperimentalUuidApi::class)

package org.sleepingcats.bridgecmdr.ui.view.model

import androidx.lifecycle.viewModelScope
import bridgecmdr.composeapp.generated.resources.Res
import bridgecmdr.composeapp.generated.resources.device_failedToGet
import bridgecmdr.composeapp.generated.resources.devices_failedToDelete
import io.github.oshai.kotlinlogging.KLogger
import kotlinx.coroutines.async
import kotlinx.coroutines.awaitAll
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import org.sleepingcats.bridgecmdr.common.service.model.Device
import org.sleepingcats.bridgecmdr.common.service.model.Driver
import org.sleepingcats.bridgecmdr.ui.repository.DeviceRepository
import org.sleepingcats.bridgecmdr.ui.repository.DriverRepository
import org.sleepingcats.bridgecmdr.ui.view.model.core.TrackingViewModel
import kotlin.uuid.ExperimentalUuidApi

class DeviceListViewModel(
  logger: KLogger,
  private val driverRepository: DriverRepository,
  private val repository: DeviceRepository,
) : TrackingViewModel(logger) {
  data class State(
    val drivers: List<Driver> = emptyList(),
    val devices: List<Device> = emptyList(),
    val error: ViewError? = null,
    val fatalError: ViewError? = null,
  )

  val state =
    combine(
      driverRepository.items,
      repository.items,
      error,
      fatalError,
      ::State,
    ).stateIn(viewModelScope, SharingStarted.WhileSubscribed(), State())

  init {
    viewModelScope.launch { refresh() }
  }

  suspend fun refresh() {
    loadingCoroutineScope {
      runCatching {
        listOf(
          async { driverRepository.refresh() },
          async { repository.refresh() },
        ).awaitAll()
      }.onFailure { throwable -> pushFatalError(throwable) { Res.string.device_failedToGet } }
    }
  }

  suspend fun delete(
    device: Device,
    onFailure: suspend () -> Unit,
  ) = loadingWhile {
    runCatching { repository.remove(device) }
      .onFailure { throwable -> pushError(throwable) { Res.string.devices_failedToDelete }.also { onFailure() } }
      .getOrNull()
  }
}
