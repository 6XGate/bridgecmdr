package org.sleepingcats.bridgecmdr.ui.view.model

import androidx.lifecycle.viewModelScope
import bridgecmdr.composeapp.generated.resources.Res
import bridgecmdr.composeapp.generated.resources.backup_export_failed
import bridgecmdr.composeapp.generated.resources.backup_import_failed
import io.github.oshai.kotlinlogging.KLogger
import io.github.vinceglb.filekit.PlatformFile
import io.github.vinceglb.filekit.toKotlinxIoPath
import io.github.vinceglb.filekit.utils.toFile
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import org.sleepingcats.bridgecmdr.common.backup.Exporter
import org.sleepingcats.bridgecmdr.common.backup.Importer
import org.sleepingcats.bridgecmdr.ui.view.model.core.TrackingViewModel

class BackupManagerViewModel(
  logger: KLogger,
  private val _import: Importer,
  private val _export: Exporter,
) : TrackingViewModel(logger) {
  class State(
    val error: ViewError? = null,
    val fatalError: ViewError? = null,
  )

  val state =
    combine(
      error,
      fatalError,
      ::State,
    ).stateIn(viewModelScope, SharingStarted.WhileSubscribed(), State())

  suspend fun import(file: PlatformFile) =
    loadingWhile {
      // Really!?!?
      runCatching { _import(file.toKotlinxIoPath().toFile().toPath()) }
        .onFailure { throwable -> pushError(throwable) { Res.string.backup_import_failed } }
    }

  suspend fun export(file: PlatformFile) =
    loadingWhile {
      // Really!?!?
      runCatching { _export(file.toKotlinxIoPath().toFile().toPath()) }
        .onFailure { throwable -> pushError(throwable) { Res.string.backup_export_failed } }
    }
}
