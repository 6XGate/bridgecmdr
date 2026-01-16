@file:OptIn(ExperimentalUuidApi::class)

package org.sleepingcats.bridgecmdr.common.service.model

import kotlinx.serialization.Serializable
import kotlin.uuid.ExperimentalUuidApi
import kotlin.uuid.Uuid

@Serializable
class UserImage(
  val id: Uuid,
  val data: ByteArray,
  val type: String,
  val hash: ByteArray,
) {
  @Serializable
  class New(
    val data: ByteArray,
    val type: String,
  )

  @Serializable
  class Info(
    val id: Uuid,
    val type: String,
    val hash: ByteArray,
  )
}
