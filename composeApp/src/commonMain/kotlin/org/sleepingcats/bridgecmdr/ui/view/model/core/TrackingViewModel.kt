package org.sleepingcats.bridgecmdr.ui.view.model.core

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import io.github.oshai.kotlinlogging.KLogger
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.CoroutineStart
import kotlinx.coroutines.coroutineScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import org.jetbrains.compose.resources.StringResource
import org.koin.core.component.KoinComponent
import kotlin.coroutines.CoroutineContext
import kotlin.coroutines.EmptyCoroutineContext

abstract class TrackingViewModel(
  protected val logger: KLogger,
) : ViewModel(),
  KoinComponent {
  private val _isLoading = MutableStateFlow(false)
  val isLoading = _isLoading.asStateFlow()

  class ViewError(
    val resource: StringResource,
    val cause: Throwable,
    val onDismiss: (() -> ViewError?)? = null,
  )

  protected val error = MutableStateFlow<ViewError?>(null)

  protected val fatalError = MutableStateFlow<ViewError?>(null)

  protected suspend fun <R> loadingWhile(block: suspend () -> R): R {
    try {
      _isLoading.update { true }
      return block()
    } finally {
      _isLoading.update { false }
    }
  }

  protected fun launchLoading(
    context: CoroutineContext = EmptyCoroutineContext,
    start: CoroutineStart = CoroutineStart.DEFAULT,
    block: suspend CoroutineScope.() -> Unit,
  ) = viewModelScope.launch(context, start) { loadingWhile { block() } }

  protected suspend fun <R> loadingCoroutineScope(block: suspend CoroutineScope.() -> R): R =
    loadingWhile { coroutineScope(block) }

  protected suspend fun <R> loadingWithContext(
    context: CoroutineContext,
    block: suspend CoroutineScope.() -> R,
  ): R = loadingWhile { withContext(context, block) }

  fun dismissError() {
    // fatalError.update { null } // Should not be able to dismiss a
    // fatal error. The dismiss action should be attached to the
    // error in cases where the view does not want to handle
    // it.
    fatalError.update { current ->
      if (current?.onDismiss != null) {
        current.onDismiss()
      } else {
        current
      }
    }

    error.update { null }
  }

  protected fun pushFatalError(
    throwable: Throwable,
    lazyMessage: () -> StringResource,
  ) {
    val resource = lazyMessage()
    // NOTE: Log will not resolve to the message, just the resource ID.
    logger.error(throwable) { resource }
    fatalError.update { ViewError(resource, throwable) }
  }

  protected fun pushError(
    throwable: Throwable,
    lazyMessage: () -> StringResource,
  ) {
    val resource = lazyMessage()
    // NOTE: Log will not resolve to the message, just the resource ID.
    logger.error(throwable) { resource }
    error.update { ViewError(resource, throwable) }
  }
}
