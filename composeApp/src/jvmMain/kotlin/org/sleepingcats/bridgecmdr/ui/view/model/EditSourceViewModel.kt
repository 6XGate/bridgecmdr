@file:OptIn(ExperimentalUuidApi::class)

package org.sleepingcats.bridgecmdr.ui.view.model

import androidx.lifecycle.viewModelScope
import bridgecmdr.composeapp.generated.resources.Res
import bridgecmdr.composeapp.generated.resources.source_failedToAdd
import bridgecmdr.composeapp.generated.resources.source_failedToGet
import bridgecmdr.composeapp.generated.resources.source_failedToUpdate
import bridgecmdr.composeapp.generated.resources.source_failedToUploadImage
import bridgecmdr.composeapp.generated.resources.source_title_maxLength
import bridgecmdr.composeapp.generated.resources.source_title_notBlank
import io.github.oshai.kotlinlogging.KLogger
import io.github.vinceglb.filekit.PlatformFile
import io.konform.validation.Validation
import io.konform.validation.ValidationResult
import io.konform.validation.constraints.maxLength
import io.konform.validation.constraints.notBlank
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.flow.update
import org.sleepingcats.bridgecmdr.common.service.model.Source
import org.sleepingcats.bridgecmdr.ui.component.firstErrorOf
import org.sleepingcats.bridgecmdr.ui.repository.SourceRepository
import org.sleepingcats.bridgecmdr.ui.view.model.core.TrackingViewModel
import kotlin.uuid.ExperimentalUuidApi
import kotlin.uuid.Uuid

class EditSourceViewModel(
  val id: Uuid,
  logger: KLogger,
  private val userImageModel: UserImageModel,
  private val repository: SourceRepository,
) : TrackingViewModel(logger) {
  data class FormState(
    val validation: ValidationResult<Source>? = null,
    val fatalError: ViewError? = null,
    val error: ViewError? = null,
  ) {
    val titleError = firstErrorOf(validation?.errors, Source::title)
  }

  private val validation = MutableStateFlow<ValidationResult<Source>?>(null)

  val state =
    combine(validation, fatalError, error, ::FormState)
      .stateIn(viewModelScope, SharingStarted.WhileSubscribed(), FormState())

  private val validate =
    Validation {
      Source::title {
        notBlank() hint Res.string.source_title_notBlank.key
        maxLength(255) hint Res.string.source_title_maxLength.key
      }
    }

  val title = MutableStateFlow(Source.Blank.title)

  val image = MutableStateFlow(Source.Blank.image)

  private val source: Source get() =
    Source(
      id = id,
      title = title.value,
      image = image.value,
    )

  init {
    launchLoading {
      runCatching {
        val foundSource = id.takeIf { it != Uuid.NIL }?.let { repository.findLatest(it) } ?: Source.Blank
        title.update { foundSource.title }
        image.update { foundSource.image }
      }.onFailure { throwable -> pushFatalError(throwable) { Res.string.source_failedToGet } }
    }
  }

  private fun pushError(
    throwable: Throwable,
    source: Source,
  ) {
    pushError(throwable) {
      if (source.id == Uuid.NIL) {
        Res.string.source_failedToAdd
      } else {
        Res.string.source_failedToUpdate
      }
    }
  }

  private inline fun ifValid(onSuccess: (Source) -> Unit): Boolean {
    val result = validate(source)
    if (result.isValid) return onSuccess(source).let { true }
    return this.validation.update { result }.let { false }
  }

  fun save(onSuccess: (Source) -> Unit) =
    ifValid { source ->
      launchLoading {
        runCatching { if (source.id == Uuid.NIL) repository.add(source) else repository.update(source) }
          .onFailure { throwable -> pushError(throwable, source) }
          .onSuccess { value -> onSuccess(value) }
      }
    }

  fun setTitle(newTitle: String) = title.update { newTitle }

  fun setImage(newImage: Uuid?) = image.update { newImage }

  suspend fun uploadImage(file: PlatformFile): Uuid? =
    loadingWhile { userImageModel.uploadImage(file) { pushError(it) { Res.string.source_failedToUploadImage } } }
}
