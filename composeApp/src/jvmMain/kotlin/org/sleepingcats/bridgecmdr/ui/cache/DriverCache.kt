@file:OptIn(ExperimentalUuidApi::class)

package org.sleepingcats.bridgecmdr.ui.cache

import org.sleepingcats.bridgecmdr.common.service.model.Driver
import org.sleepingcats.bridgecmdr.ui.cache.core.DataCache
import kotlin.uuid.ExperimentalUuidApi
import kotlin.uuid.Uuid

class DriverCache : DataCache<Driver, Uuid>() {
  override val key = Driver::id
}
