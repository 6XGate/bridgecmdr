@file:OptIn(ExperimentalUuidApi::class)

package org.sleepingcats.bridgecmdr.common.driver.shinybow

import bridgecmdr.composeapp.generated.resources.Res
import bridgecmdr.composeapp.generated.resources.company_shinybow
import bridgecmdr.composeapp.generated.resources.driver_shinybow_v3_0_matrix
import bridgecmdr.composeapp.generated.resources.internal_contributor
import org.jetbrains.compose.resources.getString
import org.sleepingcats.bridgecmdr.common.core.DriverModule
import org.sleepingcats.bridgecmdr.common.protocol.ShinybowProtocol
import org.sleepingcats.bridgecmdr.common.service.model.Capabilities
import org.sleepingcats.bridgecmdr.common.service.model.DriverKind
import kotlin.uuid.ExperimentalUuidApi
import kotlin.uuid.Uuid

val ShinybowVersion3Driver =
  DriverModule.define {
    id = Uuid.parseHexDash("BBED08A1-C749-4733-8F2E-96C9B56C0C41")
    kind = DriverKind.Switch
    title = getString(Res.string.driver_shinybow_v3_0_matrix)
    company = getString(Res.string.company_shinybow)
    provider = getString(Res.string.internal_contributor)
    experimental = true
    capabilities = Capabilities.MULTIPLE_OUTPUTS or Capabilities.AUDIO_INDEPENDENT

    protocol = ShinybowProtocol(3)
  }
