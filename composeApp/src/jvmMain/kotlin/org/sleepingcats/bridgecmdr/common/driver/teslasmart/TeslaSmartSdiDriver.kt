@file:OptIn(ExperimentalUuidApi::class)

package org.sleepingcats.bridgecmdr.common.driver.teslasmart

import bridgecmdr.composeapp.generated.resources.Res
import bridgecmdr.composeapp.generated.resources.company_teslaelec
import bridgecmdr.composeapp.generated.resources.driver_telsasmart_sdi
import bridgecmdr.composeapp.generated.resources.internal_contributor
import org.jetbrains.compose.resources.getString
import org.sleepingcats.bridgecmdr.common.core.DriverModule
import org.sleepingcats.bridgecmdr.common.protocol.TeslaElecSdiProtocol
import org.sleepingcats.bridgecmdr.common.service.model.DriverKind
import kotlin.uuid.ExperimentalUuidApi
import kotlin.uuid.Uuid

val TeslaSmartSdiDriver =
  DriverModule.define {
    id = Uuid.parseHexDash("DDB13CBC-ABFC-405E-9EA6-4A999F9A16BD")
    kind = DriverKind.Switch
    title = getString(Res.string.driver_telsasmart_sdi)
    company = getString(Res.string.company_teslaelec)
    provider = getString(Res.string.internal_contributor)
    experimental = true

    protocol = TeslaElecSdiProtocol()
  }
