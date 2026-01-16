@file:OptIn(ExperimentalUuidApi::class)

package org.sleepingcats.bridgecmdr.common.driver.teslasmart

import bridgecmdr.composeapp.generated.resources.Res
import bridgecmdr.composeapp.generated.resources.company_teslaelec
import bridgecmdr.composeapp.generated.resources.driver_telsasmart_matrix
import bridgecmdr.composeapp.generated.resources.internal_contributor
import org.jetbrains.compose.resources.getString
import org.sleepingcats.bridgecmdr.common.core.DriverModule
import org.sleepingcats.bridgecmdr.common.protocol.TeslaElecMatrixProtocol
import org.sleepingcats.bridgecmdr.common.service.model.Capabilities
import org.sleepingcats.bridgecmdr.common.service.model.DriverKind
import kotlin.uuid.ExperimentalUuidApi
import kotlin.uuid.Uuid

val TeslaSmartMatrixDriver =
  DriverModule.define {
    id = Uuid.parseHexDash("671824ED-0BC4-43A6-85CC-4877890A7722")
    kind = DriverKind.Switch
    title = getString(Res.string.driver_telsasmart_matrix)
    company = getString(Res.string.company_teslaelec)
    provider = getString(Res.string.internal_contributor)
    experimental = true
    capabilities = Capabilities.MULTIPLE_OUTPUTS

    protocol = TeslaElecMatrixProtocol()
  }
