@file:OptIn(ExperimentalUuidApi::class)

package org.sleepingcats.bridgecmdr.ui.repository

import org.sleepingcats.bridgecmdr.common.service.DeviceService
import org.sleepingcats.bridgecmdr.common.service.model.Device
import org.sleepingcats.bridgecmdr.ui.cache.DeviceCache
import org.sleepingcats.bridgecmdr.ui.repository.core.DataRepository
import kotlin.uuid.ExperimentalUuidApi
import kotlin.uuid.Uuid

class DeviceRepository(
  cache: DeviceCache,
  private val service: DeviceService,
) : DataRepository<Device, Uuid, DeviceCache>(cache) {
  override suspend fun refresh() = cache.refresh(service.all())

  override suspend fun add(item: Device) = cache.add(service.insert(Device.Payload(item)))

  override suspend fun upsert(item: Device) = cache.upsert(service.upsert(item))

  override suspend fun update(item: Device) = cache.update(service.updateById(item.id, Device.Payload(item)))

  override suspend fun remove(item: Device) = cache.remove(service.deleteById(item.id))
}
