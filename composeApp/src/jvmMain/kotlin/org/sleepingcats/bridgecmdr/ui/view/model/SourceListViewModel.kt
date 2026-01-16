@file:OptIn(ExperimentalUuidApi::class)

package org.sleepingcats.bridgecmdr.ui.view.model

import androidx.lifecycle.viewModelScope
import bridgecmdr.composeapp.generated.resources.Res
import bridgecmdr.composeapp.generated.resources.sources_failedToDelete
import bridgecmdr.composeapp.generated.resources.sources_failedToRefresh
import io.github.oshai.kotlinlogging.KLogger
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import org.sleepingcats.bridgecmdr.common.service.model.Source
import org.sleepingcats.bridgecmdr.ui.repository.SourceRepository
import org.sleepingcats.bridgecmdr.ui.view.model.core.TrackingViewModel
import kotlin.uuid.ExperimentalUuidApi

class SourceListViewModel(
  logger: KLogger,
  private val repository: SourceRepository,
) : TrackingViewModel(logger) {
  data class State(
    val sources: List<Source> = emptyList(),
    val error: ViewError? = null,
    val fatalError: ViewError? = null,
  )

  val state =
    combine(
      repository.items,
      error,
      fatalError,
      ::State,
    ).stateIn(viewModelScope, SharingStarted.WhileSubscribed(), State())

  init {
    viewModelScope.launch { refresh() }
  }

  suspend fun refresh() {
    loadingWhile {
      runCatching { repository.refresh() }
        .onFailure { throwable -> pushFatalError(throwable) { Res.string.sources_failedToRefresh } }
    }
  }

  suspend fun delete(item: Source) =
    loadingWhile {
      runCatching { repository.remove(item) }
        .onFailure { throwable -> pushError(throwable) { Res.string.sources_failedToDelete } }
        .getOrNull()
    }
}
