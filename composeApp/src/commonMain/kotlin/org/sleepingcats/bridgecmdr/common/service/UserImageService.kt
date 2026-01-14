@file:OptIn(ExperimentalUuidApi::class)

package org.sleepingcats.bridgecmdr.common.service

import org.sleepingcats.bridgecmdr.common.service.model.UserImage
import kotlin.uuid.ExperimentalUuidApi
import kotlin.uuid.Uuid

interface UserImageService {
  suspend fun all(): List<UserImage>

  suspend fun findById(id: Uuid): UserImage

  suspend fun tryFindById(id: Uuid): UserImage?

  suspend fun upsert(image: UserImage.New): UserImage

  suspend fun deleteById(id: Uuid): UserImage
}
