@file:OptIn(ExperimentalUuidApi::class)

package org.sleepingcats.bridgecmdr.common.driver.teslasmart

import bridgecmdr.composeapp.generated.resources.Res
import bridgecmdr.composeapp.generated.resources.company_teslaelec
import bridgecmdr.composeapp.generated.resources.driver_telsasmart_kvm
import bridgecmdr.composeapp.generated.resources.internal_contributor
import org.jetbrains.compose.resources.getString
import org.sleepingcats.bridgecmdr.common.core.DriverModule
import org.sleepingcats.bridgecmdr.common.protocol.TeslaElecKvmProtocol
import org.sleepingcats.bridgecmdr.common.service.model.DriverKind
import kotlin.uuid.ExperimentalUuidApi
import kotlin.uuid.Uuid

val TeslaSmartKvmDriver =
  DriverModule.define {
    id = Uuid.parseHexDash("91D5BC95-A8E2-4F58-BCAC-A77BA1054D61")
    kind = DriverKind.Switch
    title = getString(Res.string.driver_telsasmart_kvm)
    company = getString(Res.string.company_teslaelec)
    provider = getString(Res.string.internal_contributor)
    experimental = true

    protocol = TeslaElecKvmProtocol()
  }
