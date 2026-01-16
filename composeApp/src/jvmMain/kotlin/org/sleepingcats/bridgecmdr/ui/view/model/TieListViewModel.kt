@file:OptIn(ExperimentalUuidApi::class)

package org.sleepingcats.bridgecmdr.ui.view.model

import androidx.lifecycle.viewModelScope
import bridgecmdr.composeapp.generated.resources.Res
import bridgecmdr.composeapp.generated.resources.ties_failedToDelete
import bridgecmdr.composeapp.generated.resources.ties_failedToRefresh
import bridgecmdr.composeapp.generated.resources.ties_failedToUpdateImage
import bridgecmdr.composeapp.generated.resources.ties_failedToUpdateTitle
import bridgecmdr.composeapp.generated.resources.ties_failedToUploadImage
import io.github.oshai.kotlinlogging.KLogger
import io.github.vinceglb.filekit.PlatformFile
import kotlinx.coroutines.async
import kotlinx.coroutines.awaitAll
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import org.sleepingcats.bridgecmdr.common.service.model.Device
import org.sleepingcats.bridgecmdr.common.service.model.Driver
import org.sleepingcats.bridgecmdr.common.service.model.Source
import org.sleepingcats.bridgecmdr.common.service.model.Tie
import org.sleepingcats.bridgecmdr.ui.repository.DeviceRepository
import org.sleepingcats.bridgecmdr.ui.repository.DriverRepository
import org.sleepingcats.bridgecmdr.ui.repository.SourceRepository
import org.sleepingcats.bridgecmdr.ui.repository.TieRepository
import org.sleepingcats.bridgecmdr.ui.view.model.core.TrackingViewModel
import org.sleepingcats.core.extensions.combine
import kotlin.uuid.ExperimentalUuidApi
import kotlin.uuid.Uuid

class TieListViewModel(
  private val sourceId: Uuid,
  logger: KLogger,
  private val userImageModel: UserImageModel,
  private val driverRepository: DriverRepository,
  private val deviceRepository: DeviceRepository,
  private val sourceRepository: SourceRepository,
  private val repository: TieRepository,
) : TrackingViewModel(logger) {
  data class State(
    val drivers: List<Driver> = emptyList(),
    val devices: List<Device> = emptyList(),
    val source: Source = Source.Blank,
    val ties: List<Tie> = emptyList(),
    val error: ViewError? = null,
    val fatalError: ViewError? = null,
  )

  val state =
    combine(
      driverRepository.items,
      deviceRepository.items,
      sourceRepository.find(sourceId),
      repository.items,
      error,
      fatalError,
    ) { drivers, devices, source, ties, error, fatalError ->
      State(
        drivers = drivers,
        devices = devices,
        source = checkNotNull(source) { "No source selected" },
        ties = ties,
        error = error,
        fatalError = fatalError,
      )
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(), State())

  init {
    viewModelScope.launch { refresh() }
  }

  suspend fun refresh() {
    loadingCoroutineScope {
      runCatching {
        listOf(
          async { driverRepository.refresh() },
          async { deviceRepository.refresh() },
        ).awaitAll()

        val source = checkNotNull(sourceRepository.findLatest(sourceId)) { "Source not found" }
        repository.refreshFromSource(source)
      }.onFailure { throwable -> pushFatalError(throwable) { Res.string.ties_failedToRefresh } }
    }
  }

  suspend fun deleteTie(
    tie: Tie,
    onFailure: suspend () -> Unit,
  ) = loadingWhile {
    runCatching { repository.remove(tie) }
      .onFailure { throwable -> pushError(throwable) { Res.string.ties_failedToDelete }.also { onFailure() } }
      .getOrNull()
  }

  suspend fun partialUpdateSource(
    id: Uuid,
    updates: Source.Update,
    onFailure: suspend () -> Unit,
  ): Source? =
    loadingWhile {
      runCatching { sourceRepository.partialUpdate(id, updates) }
        .onFailure { throwable ->
          pushError(throwable) {
            if (updates.title != null) {
              Res.string.ties_failedToUpdateTitle
            } else {
              Res.string.ties_failedToUpdateImage
            }
          }.also { onFailure() }
        }.getOrNull()
    }

  suspend fun uploadImage(file: PlatformFile): Uuid? =
    loadingWhile { userImageModel.uploadImage(file) { pushError(it) { Res.string.ties_failedToUploadImage } } }
}
