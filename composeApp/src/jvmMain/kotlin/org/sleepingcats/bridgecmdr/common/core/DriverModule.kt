@file:OptIn(ExperimentalUuidApi::class)

package org.sleepingcats.bridgecmdr.common.core

import org.koin.core.component.KoinComponent
import org.sleepingcats.bridgecmdr.common.service.model.Driver
import kotlin.uuid.ExperimentalUuidApi

class DriverModule(
  builder: DriverBuilder,
) : Driver(
    checkNotNull(builder.id) { "Driver ID must be provided" },
    checkNotNull(builder.kind) { "Driver kind must be provided" },
    checkNotNull(builder.title) { "Driver title must be provided" },
    checkNotNull(builder.company) { "Driver company must be provided" },
    checkNotNull(builder.provider) { "Driver provider must be provided" },
    builder.enabled,
    builder.experimental,
    builder.capabilities,
  ),
  DriverProtocol by checkNotNull(builder.protocol, { "Driver protocol must be provided" }),
  KoinComponent {
  companion object {
    fun define(builder: suspend DriverBuilder.() -> Unit): suspend () -> DriverModule =
      { DriverModule(DriverBuilder().apply { this.builder() }) }
  }
}
