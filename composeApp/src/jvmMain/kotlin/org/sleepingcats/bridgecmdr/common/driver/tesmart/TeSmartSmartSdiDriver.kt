@file:OptIn(ExperimentalUuidApi::class)

package org.sleepingcats.bridgecmdr.common.driver.tesmart

import bridgecmdr.composeapp.generated.resources.Res
import bridgecmdr.composeapp.generated.resources.company_teslaelec
import bridgecmdr.composeapp.generated.resources.driver_tesmart_sdi
import bridgecmdr.composeapp.generated.resources.internal_contributor
import org.jetbrains.compose.resources.getString
import org.sleepingcats.bridgecmdr.common.core.DriverModule
import org.sleepingcats.bridgecmdr.common.protocol.TeslaElecSdiProtocol
import org.sleepingcats.bridgecmdr.common.service.model.DriverKind
import kotlin.uuid.ExperimentalUuidApi
import kotlin.uuid.Uuid

val TeSmartSmartSdiDriver =
  DriverModule.define {
    id = Uuid.parseHexDash("8C524E65-83EF-4AEF-B0DA-29C4582AA4A0")
    kind = DriverKind.Switch
    title = getString(Res.string.driver_tesmart_sdi)
    company = getString(Res.string.company_teslaelec)
    provider = getString(Res.string.internal_contributor)
    experimental = true

    protocol = TeslaElecSdiProtocol()
  }
