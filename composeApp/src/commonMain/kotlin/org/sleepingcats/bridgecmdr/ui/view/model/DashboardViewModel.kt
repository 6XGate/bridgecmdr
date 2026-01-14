@file:OptIn(ExperimentalUuidApi::class)

package org.sleepingcats.bridgecmdr.ui.view.model

import androidx.lifecycle.viewModelScope
import io.github.oshai.kotlinlogging.KLogger
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import org.sleepingcats.bridgecmdr.common.service.model.Source
import org.sleepingcats.bridgecmdr.common.setting.IconSize
import org.sleepingcats.bridgecmdr.common.setting.PowerOffTaps
import org.sleepingcats.bridgecmdr.ui.repository.SettingsRepository
import org.sleepingcats.bridgecmdr.ui.repository.SourceRepository
import org.sleepingcats.bridgecmdr.ui.view.model.core.TrackingViewModel
import kotlin.uuid.ExperimentalUuidApi
import kotlin.uuid.Uuid

open class DashboardViewModel(
  logger: KLogger,
  private val settingsRepository: SettingsRepository,
  private val repository: SourceRepository,
) : TrackingViewModel(logger) {
  data class State(
    val isLoading: Boolean = false,
    val sources: List<Source> = emptyList(),
    val active: Source? = null,
    val dragged: Source? = null,
    val iconSize: IconSize = IconSize.Normal,
    val powerOffTaps: PowerOffTaps = PowerOffTaps.Single,
    val buttonOrder: List<Uuid> = emptyList(),
  )

  private val dragged = MutableStateFlow<Source?>(null)

  val state =
    combine(
      isLoading,
      repository.items,
      repository.active,
      dragged,
      settingsRepository.data,
    ) { loading, sources, active, dragged, settings ->
      val sortedSources =
        settings.buttonOrder
          .mapNotNull { id -> sources.find { it.id == id } }
          .run {
            if (size < sources.size) {
              plus(sources.filter { it.id !in settings.buttonOrder })
            } else {
              this
            }
          }

      State(
        isLoading = loading,
        sources = sortedSources,
        active = active,
        dragged = dragged,
        iconSize = settings.iconSize,
        powerOffTaps = settings.powerOffTaps,
        buttonOrder = sortedSources.map { it.id },
      )
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(), State())

  init {
    launchLoading { refreshSources() }
  }

  suspend fun refreshSources(onError: (suspend (cause: Throwable) -> Unit)? = null) =
    loadingWhile {
      try {
        repository.refresh()
      } catch (cause: Throwable) {
        logger.error(cause) { "Source refresh failed" }
        onError?.invoke(cause)
      }
    }

  fun activateSource(source: Source) {
    viewModelScope.launch {
      try {
        repository.activate(source)
      } catch (cause: Throwable) {
        logger.error(cause) { "Source activation failed" }
      }
    }
  }

  suspend fun moveButton(
    from: Int,
    to: Int,
  ) {
    settingsRepository.setButtonOrder(
      state.value.buttonOrder.toMutableList().apply {
        this[to] = this[from].also { this[from] = this[to] }
      },
    )
  }
}
