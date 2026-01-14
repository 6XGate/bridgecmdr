@file:OptIn(ExperimentalUuidApi::class)

package org.sleepingcats.bridgecmdr.common.driver.sony

import bridgecmdr.composeapp.generated.resources.Res
import bridgecmdr.composeapp.generated.resources.company_sony
import bridgecmdr.composeapp.generated.resources.driver_sony_rs_485_monitor
import bridgecmdr.composeapp.generated.resources.internal_contributor
import org.jetbrains.compose.resources.getString
import org.sleepingcats.bridgecmdr.common.core.DriverModule
import org.sleepingcats.bridgecmdr.common.protocol.SonyProtocol
import org.sleepingcats.bridgecmdr.common.service.model.DriverKind
import kotlin.uuid.ExperimentalUuidApi
import kotlin.uuid.Uuid

val SonyRs485Driver =
  DriverModule.define {
    id = Uuid.parseHexDash("8626D6D3-C211-4D21-B5CC-F5E3B50D9FF0")
    kind = DriverKind.Monitor
    title = getString(Res.string.driver_sony_rs_485_monitor)
    company = getString(Res.string.company_sony)
    provider = getString(Res.string.internal_contributor)

    protocol = SonyProtocol()
  }
