@file:OptIn(ExperimentalUuidApi::class)

package org.sleepingcats.bridgecmdr.common.service

import org.sleepingcats.bridgecmdr.common.service.model.Device
import kotlin.uuid.ExperimentalUuidApi
import kotlin.uuid.Uuid

interface DeviceService {
  suspend fun all(): List<Device>

  suspend fun findById(id: Uuid): Device

  suspend fun insert(payload: Device.Payload): Device

  suspend fun upsert(device: Device): Device

  suspend fun updateById(
    id: Uuid,
    payload: Device.Payload,
  ): Device

  suspend fun partialUpdateById(
    id: Uuid,
    payload: Device.Update,
  ): Device

  suspend fun deleteById(id: Uuid): Device
}
