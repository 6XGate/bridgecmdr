@file:OptIn(ExperimentalUuidApi::class)

package org.sleepingcats.bridgecmdr.common.service.model

import kotlinx.serialization.Serializable
import kotlin.uuid.ExperimentalUuidApi
import kotlin.uuid.Uuid

@Serializable
data class Source(
  val id: Uuid,
  val title: String,
  val image: Uuid?,
) {
  companion object {
    val Blank = Source(Uuid.NIL, "", null)
  }

  @Serializable
  data class Payload(
    val title: String,
    val image: Uuid?,
  ) {
    constructor(source: Source) : this(source.title, source.image)
  }

  @Serializable
  data class Update(
    val title: String? = null,
    val image: Uuid? = null,
  ) {
    constructor(source: Source) : this(source.title, source.image)
  }
}
