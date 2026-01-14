package org.sleepingcats.bridgecmdr.common.service

import org.sleepingcats.bridgecmdr.common.service.model.PortInfo

interface SerialPortService {
  suspend fun all(): List<PortInfo>
}
