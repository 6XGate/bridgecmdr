package org.sleepingcats.bridgecmdr.ui.repository

import org.sleepingcats.bridgecmdr.common.service.SerialPortService
import org.sleepingcats.bridgecmdr.common.service.model.PortInfo
import org.sleepingcats.bridgecmdr.ui.cache.PortCache
import org.sleepingcats.bridgecmdr.ui.repository.core.CachingRepository

class PortRepository(
  cache: PortCache,
  private val service: SerialPortService,
) : CachingRepository<PortInfo, String, PortCache>(cache) {
  override suspend fun refresh() = cache.refresh(service.all())
}
