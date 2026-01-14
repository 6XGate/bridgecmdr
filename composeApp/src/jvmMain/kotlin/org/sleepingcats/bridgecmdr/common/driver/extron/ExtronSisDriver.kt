@file:OptIn(ExperimentalUuidApi::class)

package org.sleepingcats.bridgecmdr.common.driver.extron

import bridgecmdr.composeapp.generated.resources.Res
import bridgecmdr.composeapp.generated.resources.company_extron
import bridgecmdr.composeapp.generated.resources.driver_extron_sis_matrix
import bridgecmdr.composeapp.generated.resources.internal_contributor
import org.jetbrains.compose.resources.getString
import org.sleepingcats.bridgecmdr.common.core.DriverModule
import org.sleepingcats.bridgecmdr.common.protocol.ExtronSisProtocol
import org.sleepingcats.bridgecmdr.common.service.model.Capabilities
import org.sleepingcats.bridgecmdr.common.service.model.DriverKind
import kotlin.uuid.ExperimentalUuidApi
import kotlin.uuid.Uuid

val ExtronSisDriver =
  DriverModule.define {
    id = Uuid.parseHexDash("4C8F2838-C91D-431E-84DD-3666D14A6E2C")
    kind = DriverKind.Switch
    title = getString(Res.string.driver_extron_sis_matrix)
    company = getString(Res.string.company_extron)
    provider = getString(Res.string.internal_contributor)
    capabilities = Capabilities.MULTIPLE_OUTPUTS or Capabilities.AUDIO_INDEPENDENT

    protocol = ExtronSisProtocol()
  }
