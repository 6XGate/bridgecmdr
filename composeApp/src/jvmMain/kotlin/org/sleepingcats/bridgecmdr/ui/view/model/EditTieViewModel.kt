@file:OptIn(ExperimentalUuidApi::class, ExperimentalCoroutinesApi::class)

package org.sleepingcats.bridgecmdr.ui.view.model

import androidx.lifecycle.viewModelScope
import bridgecmdr.composeapp.generated.resources.Res
import bridgecmdr.composeapp.generated.resources.tie_audioChannel_minimum
import bridgecmdr.composeapp.generated.resources.tie_deviceId_notNil
import bridgecmdr.composeapp.generated.resources.tie_failedToAdd
import bridgecmdr.composeapp.generated.resources.tie_failedToGet
import bridgecmdr.composeapp.generated.resources.tie_failedToUpdate
import bridgecmdr.composeapp.generated.resources.tie_inputChannel_minimum
import bridgecmdr.composeapp.generated.resources.tie_videoChannel_minimum
import io.github.oshai.kotlinlogging.KLogger
import io.konform.validation.Validation
import io.konform.validation.ValidationResult
import io.konform.validation.constraints.minimum
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.filter
import kotlinx.coroutines.flow.flatMapLatest
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.onEach
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.flow.update
import org.sleepingcats.bridgecmdr.common.service.model.Capabilities
import org.sleepingcats.bridgecmdr.common.service.model.Device
import org.sleepingcats.bridgecmdr.common.service.model.Tie
import org.sleepingcats.bridgecmdr.ui.component.firstErrorOf
import org.sleepingcats.bridgecmdr.ui.repository.DeviceRepository
import org.sleepingcats.bridgecmdr.ui.repository.DriverRepository
import org.sleepingcats.bridgecmdr.ui.repository.TieRepository
import org.sleepingcats.bridgecmdr.ui.view.model.core.TrackingViewModel
import kotlin.uuid.ExperimentalUuidApi
import kotlin.uuid.Uuid

class EditTieViewModel(
  val sourceId: Uuid,
  val id: Uuid,
  logger: KLogger,
  private val driverRepository: DriverRepository,
  private val deviceRepository: DeviceRepository,
  private val repository: TieRepository,
) : TrackingViewModel(logger) {
  data class FormState(
    val validation: ValidationResult<Tie>? = null,
    val fatalError: ViewError? = null,
    val error: ViewError? = null,
  ) {
    val deviceError = firstErrorOf(validation?.errors, Tie::deviceId)
    val inputChannelError = firstErrorOf(validation?.errors, Tie::inputChannel)
    val outputVideoChannelError = firstErrorOf(validation?.errors, Tie::outputVideoChannel)
    val outputAudioChannelError = firstErrorOf(validation?.errors, Tie::outputAudioChannel)
  }

  private val validation = MutableStateFlow<ValidationResult<Tie>?>(null)

  val drivers = driverRepository.items

  val devices =
    deviceRepository.items
      .map { devices ->
        val drivers = driverRepository.latest()
        devices.filter { device -> drivers.find { it.id == device.driverId } != null }
      }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(), emptyList())

  val state =
    combine(validation, fatalError, error, ::FormState)
      .stateIn(viewModelScope, SharingStarted.WhileSubscribed(), FormState())

  private val validate =
    Validation {
      Tie::deviceId {
        constrain(Res.string.tie_deviceId_notNil.key) { it != Uuid.NIL }
      }

      Tie::inputChannel {
        minimum(1) hint Res.string.tie_inputChannel_minimum.key
      }

      dynamic {
        val driver = driver.value
        if (driver != null && driver.capabilities and Capabilities.MULTIPLE_OUTPUTS != 0) {
          Tie::outputVideoChannel required {
            hint = Res.string.tie_videoChannel_minimum.key
            minimum(1) hint Res.string.tie_videoChannel_minimum.key
          }
        }
      }

      Tie::outputAudioChannel ifPresent {
        minimum(1) hint Res.string.tie_audioChannel_minimum.key
      }
    }

  val device = MutableStateFlow<Device?>(null)

  val driver =
    device
      .flatMapLatest {
        drivers
          .filter { drivers -> drivers.isNotEmpty() }
          .map { drivers -> drivers.find { it.id == device.value?.driverId } }
      }.onEach { driver ->
        // With each driver change ensure the channels make sense.
        if (driver == null) {
          outputVideoChannel.update { Tie.Blank.outputVideoChannel }
          outputAudioChannel.update { Tie.Blank.outputAudioChannel }
          return@onEach
        }

        if ((driver.capabilities and Capabilities.MULTIPLE_OUTPUTS) != 0) {
          outputVideoChannel.update { current -> current ?: 1 }
        } else {
          outputVideoChannel.update { null }
        }

        if ((driver.capabilities and Capabilities.AUDIO_INDEPENDENT) == 0) {
          outputAudioChannel.update { null }
        }
      }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(), null)

  val inputChannel = MutableStateFlow(Tie.Blank.inputChannel)

  val outputVideoChannel = MutableStateFlow(Tie.Blank.outputVideoChannel)

  val outputAudioChannel = MutableStateFlow(Tie.Blank.outputAudioChannel)

  private val tie: Tie get() =
    Tie(
      id = id,
      sourceId = sourceId,
      deviceId = device.value?.id ?: Uuid.NIL,
      inputChannel = inputChannel.value,
      outputVideoChannel = outputVideoChannel.value,
      outputAudioChannel = outputAudioChannel.value,
    )

  init {
    launchLoading {
      runCatching {
        val foundTie =
          id.takeIf { it != Uuid.NIL }?.let { repository.findLatest(it) }
            ?: Tie.Blank.copy(sourceId = sourceId)

        check(foundTie.sourceId == sourceId) { "Tie sourceId mismatch" }

        device.update { deviceRepository.findLatest(foundTie.deviceId) }
        inputChannel.update { foundTie.inputChannel }
        outputVideoChannel.update { foundTie.outputVideoChannel }
        outputAudioChannel.update { foundTie.outputAudioChannel }
      }.onFailure { throwable -> pushFatalError(throwable) { Res.string.tie_failedToGet } }
    }
  }

  private fun pushError(
    throwable: Throwable,
    tie: Tie,
  ) {
    pushError(throwable) {
      if (tie.id == Uuid.NIL) {
        Res.string.tie_failedToAdd
      } else {
        Res.string.tie_failedToUpdate
      }
    }
  }

  private inline fun ifValid(onSuccess: (Tie) -> Unit): Boolean {
    val result = validate(tie)
    if (result.isValid) return onSuccess(tie).let { true }
    return this.validation.update { result }.let { false }
  }

  fun save(onSuccess: (Tie) -> Unit) =
    ifValid { tie ->
      launchLoading {
        runCatching { if (tie.id == Uuid.NIL) repository.add(tie) else repository.update(tie) }
          .onFailure { throwable -> pushError(throwable, tie) }
          .onSuccess { value -> onSuccess(value) }
      }
    }

  fun setDevice(newDevice: Device?) = device.update { newDevice }

  fun setInputChannel(newInputChannel: Int) = inputChannel.update { newInputChannel }

  fun setOutputVideoChannel(newOutputVideoChannel: Int?) = outputVideoChannel.update { newOutputVideoChannel }

  fun setOutputAudioChannel(newOutputAudioChannel: Int?) = outputAudioChannel.update { newOutputAudioChannel }
}
