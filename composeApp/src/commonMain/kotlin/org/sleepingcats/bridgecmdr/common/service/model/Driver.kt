@file:OptIn(ExperimentalUuidApi::class)

package org.sleepingcats.bridgecmdr.common.service.model

import kotlinx.serialization.Serializable
import kotlin.uuid.ExperimentalUuidApi
import kotlin.uuid.Uuid

@Serializable
open class Driver(
  val id: Uuid,
  val kind: DriverKind,
  val title: String,
  val company: String,
  val provider: String,
  val enabled: Boolean = true,
  val experimental: Boolean = false,
  val capabilities: Int = 0,
)
