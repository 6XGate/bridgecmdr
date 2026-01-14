@file:OptIn(ExperimentalUuidApi::class)

package org.sleepingcats.bridgecmdr.common.service.model

import kotlinx.serialization.Serializable
import kotlin.uuid.ExperimentalUuidApi
import kotlin.uuid.Uuid

@Serializable
data class Device(
  val id: Uuid,
  val driverId: Uuid,
  val title: String,
  val path: String,
) {
  companion object {
    val Blank = Device(Uuid.NIL, Uuid.NIL, "", "")
  }

  @Serializable
  data class Payload(
    val driverId: Uuid,
    val title: String,
    val path: String,
  ) {
    constructor(device: Device) : this(device.driverId, device.title, device.path)
  }

  @Serializable
  data class Update(
    val driverId: Uuid? = null,
    val title: String? = null,
    val path: String? = null,
  ) {
    constructor(device: Device) : this(device.driverId, device.title, device.path)
  }
}
