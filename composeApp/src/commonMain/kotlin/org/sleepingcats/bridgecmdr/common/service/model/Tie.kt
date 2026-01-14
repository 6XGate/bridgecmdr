@file:OptIn(ExperimentalUuidApi::class)

package org.sleepingcats.bridgecmdr.common.service.model

import kotlinx.serialization.Serializable
import kotlin.uuid.ExperimentalUuidApi
import kotlin.uuid.Uuid

@Serializable
data class Tie(
  val id: Uuid,
  val sourceId: Uuid,
  val deviceId: Uuid,
  val inputChannel: Int,
  val outputVideoChannel: Int? = null,
  val outputAudioChannel: Int? = null,
) {
  companion object {
    val Blank = Tie(Uuid.NIL, Uuid.NIL, Uuid.NIL, 1, null, null)
  }

  @Serializable
  data class Payload(
    val sourceId: Uuid,
    val deviceId: Uuid,
    val inputChannel: Int,
    val outputVideoChannel: Int? = null,
    val outputAudioChannel: Int? = null,
  ) {
    constructor(tie: Tie) : this(
      sourceId = tie.sourceId,
      deviceId = tie.deviceId,
      inputChannel = tie.inputChannel,
      outputVideoChannel = tie.outputVideoChannel,
      outputAudioChannel = tie.outputAudioChannel,
    )
  }

  @Serializable
  data class Update(
    val sourceId: Uuid? = null,
    val deviceId: Uuid? = null,
    val inputChannel: Int? = null,
    val outputVideoChannel: Int? = null,
    val outputAudioChannel: Int? = null,
  ) {
    constructor(tie: Tie) : this(
      sourceId = tie.sourceId,
      deviceId = tie.deviceId,
      inputChannel = tie.inputChannel,
      outputVideoChannel = tie.outputVideoChannel,
      outputAudioChannel = tie.outputAudioChannel,
    )
  }
}
