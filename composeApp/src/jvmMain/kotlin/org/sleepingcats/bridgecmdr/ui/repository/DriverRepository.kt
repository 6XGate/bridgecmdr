@file:OptIn(ExperimentalUuidApi::class)

package org.sleepingcats.bridgecmdr.ui.repository

import org.sleepingcats.bridgecmdr.common.service.DriverService
import org.sleepingcats.bridgecmdr.common.service.model.Driver
import org.sleepingcats.bridgecmdr.ui.cache.DriverCache
import org.sleepingcats.bridgecmdr.ui.repository.core.CachingRepository
import kotlin.uuid.ExperimentalUuidApi
import kotlin.uuid.Uuid

class DriverRepository(
  cache: DriverCache,
  private val service: DriverService,
) : CachingRepository<Driver, Uuid, DriverCache>(cache) {
  override suspend fun refresh() = cache.refresh(service.all())
}
