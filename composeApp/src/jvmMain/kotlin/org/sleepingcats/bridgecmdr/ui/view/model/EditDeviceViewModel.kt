@file:OptIn(ExperimentalUuidApi::class)

package org.sleepingcats.bridgecmdr.ui.view.model

import androidx.lifecycle.viewModelScope
import bridgecmdr.composeapp.generated.resources.Res
import bridgecmdr.composeapp.generated.resources.device_driver_notNil
import bridgecmdr.composeapp.generated.resources.device_failedToAdd
import bridgecmdr.composeapp.generated.resources.device_failedToGet
import bridgecmdr.composeapp.generated.resources.device_failedToUpdate
import bridgecmdr.composeapp.generated.resources.device_path_noHostname
import bridgecmdr.composeapp.generated.resources.device_path_noPort
import bridgecmdr.composeapp.generated.resources.device_path_noType
import bridgecmdr.composeapp.generated.resources.device_title_maxLength
import bridgecmdr.composeapp.generated.resources.device_title_notBlank
import io.github.oshai.kotlinlogging.KLogger
import io.konform.validation.Validation
import io.konform.validation.ValidationResult
import io.konform.validation.constraints.maxLength
import io.konform.validation.constraints.notBlank
import io.konform.validation.constraints.pattern
import io.konform.validation.path.ValidationPath
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.flow.update
import org.sleepingcats.bridgecmdr.common.service.model.Device
import org.sleepingcats.bridgecmdr.common.service.model.Driver
import org.sleepingcats.bridgecmdr.common.service.model.PathType
import org.sleepingcats.bridgecmdr.common.service.model.PortInfo
import org.sleepingcats.bridgecmdr.ui.component.firstErrorOf
import org.sleepingcats.bridgecmdr.ui.repository.DeviceRepository
import org.sleepingcats.bridgecmdr.ui.repository.DriverRepository
import org.sleepingcats.bridgecmdr.ui.repository.PortRepository
import org.sleepingcats.bridgecmdr.ui.view.model.core.TrackingViewModel
import kotlin.uuid.ExperimentalUuidApi
import kotlin.uuid.Uuid

class EditDeviceViewModel(
  val id: Uuid,
  logger: KLogger,
  private val repository: DeviceRepository,
  driverRepository: DriverRepository,
  portRepository: PortRepository,
) : TrackingViewModel(logger) {
  data class FormState(
    val validation: ValidationResult<Device>? = null,
    val fatalError: ViewError? = null,
    val error: ViewError? = null,
  ) {
    val titleError = firstErrorOf(validation?.errors, Device::title)
    val driverError = firstErrorOf(validation?.errors, Device::driverId)
    val pathTypeError = firstErrorOf(validation?.errors, ValidationPath.of(Device::path, "pathType"))
    val pathError = firstErrorOf(validation?.errors, Device::path)
  }

  private val validation = MutableStateFlow<ValidationResult<Device>?>(null)

  val drivers = driverRepository.items

  val ports = portRepository.items

  val state =
    combine(validation, fatalError, error, ::FormState)
      .stateIn(viewModelScope, SharingStarted.WhileSubscribed(), FormState())

  private val validate =
    Validation {
      Device::title {
        notBlank() hint Res.string.device_title_notBlank.key
        maxLength(255) hint Res.string.device_title_maxLength.key
      }

      Device::driverId {
        constrain(Res.string.device_driver_notNil.key) { it != Uuid.NIL }
      }

      Device::path dynamic { device ->
        when {
          device.path.startsWith(PathType.Remote.prefix) -> {
            pattern("^ip:.+") hint Res.string.device_path_noHostname.key
          }

          device.path.startsWith(PathType.Port.prefix) -> {
            pattern("^port:.+") hint Res.string.device_path_noPort.key
          }

          else -> {
            validate("pathType", { it }) { constrain(Res.string.device_path_noType.key) { false } }
          }
        }
      }
    }

  val title = MutableStateFlow(Device.Blank.title)
  val driver = MutableStateFlow<Driver?>(null)
  val pathType = MutableStateFlow<PathType?>(null)
  val port = MutableStateFlow<PortInfo?>(null)
  val hostname = MutableStateFlow("")

  private val device: Device get() =
    Device(
      id = id,
      driverId = driver.value?.id ?: Uuid.NIL,
      title = title.value,
      path =
        when (pathType.value) {
          PathType.Port -> "${PathType.Port.prefix}${port.value?.path ?: ""}"
          PathType.Remote -> "${PathType.Remote.prefix}${hostname.value}"
          null -> ""
        },
    )

  init {
    launchLoading {
      runCatching {
        // Ports may not always be loaded.
        if (portRepository.latest().isEmpty()) portRepository.refresh()

        val foundDevice = id.takeIf { it != Uuid.NIL }?.let { repository.findLatest(it) } ?: Device.Blank
        title.update { foundDevice.title }
        driver.update { driverRepository.findLatest(foundDevice.driverId) }
        when {
          foundDevice.path.startsWith(PathType.Port.prefix) -> {
            val portPath = foundDevice.path.substring(PathType.Port.startIndex)
            pathType.update { PathType.Port }
            port.update { portRepository.findLatest(portPath) }
          }

          foundDevice.path.startsWith(PathType.Remote.prefix) -> {
            pathType.update { PathType.Remote }
            hostname.update { foundDevice.path.substring(PathType.Remote.startIndex) }
          }

          else -> {
            pathType.update { null }
          }
        }
      }.onFailure { throwable -> pushFatalError(throwable) { Res.string.device_failedToGet } }
    }
  }

  private fun pushError(
    throwable: Throwable,
    device: Device,
  ) {
    pushError(throwable) {
      if (device.id == Uuid.NIL) {
        Res.string.device_failedToAdd
      } else {
        Res.string.device_failedToUpdate
      }
    }
  }

  private inline fun ifValid(onSuccess: (Device) -> Unit): Boolean {
    val result = validate(device)
    if (result.isValid) return onSuccess(device).let { true }
    return this.validation.update { result }.let { false }
  }

  fun save(onSuccess: (Device) -> Unit) =
    ifValid { device ->
      launchLoading {
        runCatching { if (device.id == Uuid.NIL) repository.add(device) else repository.update(device) }
          .onFailure { throwable -> pushError(throwable, device) }
          .onSuccess { value -> onSuccess(value) }
      }
    }

  fun setTitle(newTitle: String) = title.update { newTitle }

  fun setDriver(newDriver: Driver?) = driver.update { newDriver }

  fun setPathType(newPathType: PathType?) {
    pathType.update { newPathType }
    hostname.update { "" }
    port.update { null }
  }

  fun setPort(newPort: PortInfo?) = port.update { newPort }

  fun setHostname(newHostname: String) = hostname.update { newHostname }
}
