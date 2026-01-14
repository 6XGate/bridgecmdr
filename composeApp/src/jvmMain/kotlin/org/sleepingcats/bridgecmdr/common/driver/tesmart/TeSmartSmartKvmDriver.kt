@file:OptIn(ExperimentalUuidApi::class)

package org.sleepingcats.bridgecmdr.common.driver.tesmart

import bridgecmdr.composeapp.generated.resources.Res
import bridgecmdr.composeapp.generated.resources.company_teslaelec
import bridgecmdr.composeapp.generated.resources.driver_tesmart_kvm
import bridgecmdr.composeapp.generated.resources.internal_contributor
import org.jetbrains.compose.resources.getString
import org.sleepingcats.bridgecmdr.common.core.DriverModule
import org.sleepingcats.bridgecmdr.common.protocol.TeslaElecKvmProtocol
import org.sleepingcats.bridgecmdr.common.service.model.DriverKind
import kotlin.uuid.ExperimentalUuidApi
import kotlin.uuid.Uuid

val TeSmartSmartKvmDriver =
  DriverModule.define {
    id = Uuid.parseHexDash("2B4EDB8E-D2D6-4809-BA18-D5B1785DA028")
    kind = DriverKind.Switch
    title = getString(Res.string.driver_tesmart_kvm)
    company = getString(Res.string.company_teslaelec)
    provider = getString(Res.string.internal_contributor)
    experimental = true

    protocol = TeslaElecKvmProtocol()
  }
