@file:OptIn(ExperimentalUuidApi::class)

package org.sleepingcats.bridgecmdr.common.driver.shinybow

import bridgecmdr.composeapp.generated.resources.Res
import bridgecmdr.composeapp.generated.resources.company_shinybow
import bridgecmdr.composeapp.generated.resources.driver_shinybow_v2_0_matrix
import bridgecmdr.composeapp.generated.resources.internal_contributor
import org.jetbrains.compose.resources.getString
import org.sleepingcats.bridgecmdr.common.core.DriverModule
import org.sleepingcats.bridgecmdr.common.protocol.ShinybowProtocol
import org.sleepingcats.bridgecmdr.common.service.model.Capabilities
import org.sleepingcats.bridgecmdr.common.service.model.DriverKind
import kotlin.uuid.ExperimentalUuidApi
import kotlin.uuid.Uuid

val ShinybowVersion2Driver =
  DriverModule.define {
    id = Uuid.parseHexDash("75FB7ED2-EE3A-46D5-B11F-7D8C3C208E7C")
    kind = DriverKind.Switch
    title = getString(Res.string.driver_shinybow_v2_0_matrix)
    company = getString(Res.string.company_shinybow)
    provider = getString(Res.string.internal_contributor)
    experimental = true
    capabilities = Capabilities.MULTIPLE_OUTPUTS

    protocol = ShinybowProtocol(2)
  }
