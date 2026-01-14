package org.sleepingcats.bridgecmdr.ui.view.model

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.coroutineScope
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import org.koin.core.component.KoinComponent
import org.sleepingcats.bridgecmdr.ui.repository.DeviceRepository
import org.sleepingcats.bridgecmdr.ui.repository.SourceRepository

class SettingsViewModel(
  private val sourceRepository: SourceRepository,
  private val deviceRepository: DeviceRepository,
) : ViewModel(),
  KoinComponent {
  val sourceCount =
    sourceRepository.items
      .map { it.size }
      .stateIn(viewModelScope, SharingStarted.Lazily, null)

  val deviceCount =
    deviceRepository.items
      .map { it.size }
      .stateIn(viewModelScope, SharingStarted.Lazily, null)

  init {
    viewModelScope.launch {
      refresh()
    }
  }

  suspend fun refresh() =
    coroutineScope {
      launch { sourceRepository.refresh() }
      launch { deviceRepository.refresh() }
    }
}
