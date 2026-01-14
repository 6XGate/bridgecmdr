@file:OptIn(ExperimentalUuidApi::class)

package org.sleepingcats.bridgecmdr.ui.view.model

import io.github.oshai.kotlinlogging.KLogger
import io.github.vinceglb.filekit.PlatformFile
import io.github.vinceglb.filekit.mimeType
import io.github.vinceglb.filekit.readBytes
import org.sleepingcats.bridgecmdr.common.service.UserImageService
import org.sleepingcats.bridgecmdr.common.service.model.UserImage
import kotlin.uuid.ExperimentalUuidApi
import kotlin.uuid.Uuid

class UserImageModel(
  val imageService: UserImageService,
  val logger: KLogger,
) {
  suspend fun uploadImage(
    file: PlatformFile,
    onError: suspend (Throwable) -> Unit,
  ): Uuid? =
    requireNotNull(file.mimeType()?.toString()) { "File has no MIME type" }
      .let { type ->
        runCatching { imageService.upsert(UserImage.New(file.readBytes(), type)).id }
          .onFailure { throwable -> onError(throwable) }
          .getOrNull()
      }
}
