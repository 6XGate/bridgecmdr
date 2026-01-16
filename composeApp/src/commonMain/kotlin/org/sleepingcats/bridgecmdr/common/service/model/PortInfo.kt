package org.sleepingcats.bridgecmdr.common.service.model

import kotlinx.serialization.Serializable

@Serializable
data class PortInfo(
  val path: String,
  val serialNumber: String,
  val manufacturer: String,
  val title: String,
  val name: String,
  val description: String,
  val location: String,
  val productId: String,
  val vendorId: String,
)
