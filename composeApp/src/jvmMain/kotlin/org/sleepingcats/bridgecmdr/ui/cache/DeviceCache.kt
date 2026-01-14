@file:OptIn(ExperimentalUuidApi::class)

package org.sleepingcats.bridgecmdr.ui.cache

import org.sleepingcats.bridgecmdr.common.service.model.Device
import org.sleepingcats.bridgecmdr.ui.cache.core.DataCache
import kotlin.uuid.ExperimentalUuidApi
import kotlin.uuid.Uuid

class DeviceCache : DataCache<Device, Uuid>() {
  override val key = Device::id
}
