@file:OptIn(ExperimentalUuidApi::class)

package org.sleepingcats.bridgecmdr.common.core

import org.koin.core.component.KoinComponent
import org.sleepingcats.bridgecmdr.common.service.model.Capabilities
import org.sleepingcats.bridgecmdr.common.service.model.DriverKind
import kotlin.uuid.ExperimentalUuidApi
import kotlin.uuid.Uuid

class DriverBuilder : KoinComponent {
  var id: Uuid? = null
  var kind: DriverKind? = null
  var title: String? = null
  var company: String? = null
  var provider: String? = null
  var enabled: Boolean = true
  var experimental: Boolean = false
  var capabilities: Int = Capabilities.NONE
  var protocol: DriverProtocol? = null
}
