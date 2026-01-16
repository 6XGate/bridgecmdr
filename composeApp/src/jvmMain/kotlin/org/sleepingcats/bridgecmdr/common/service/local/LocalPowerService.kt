@file:OptIn(ExperimentalUuidApi::class)

package org.sleepingcats.bridgecmdr.common.service.local

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.awaitAll
import kotlinx.coroutines.withContext
import org.koin.core.component.KoinComponent
import org.sleepingcats.bridgecmdr.common.service.PowerService
import kotlin.uuid.ExperimentalUuidApi

class LocalPowerService(
  private val localDeviceService: LocalDeviceService,
  private val localDriverService: LocalDriverService,
) : KoinComponent,
  PowerService {
  override suspend fun powerOn(): Unit =
    withContext(Dispatchers.IO) {
      // Not optimal, but expected use cases shouldn't have many drivers and devices.
      // But this is easier to read and understand.
      val drivers = localDriverService.all()
      localDeviceService
        .all()
        .mapNotNull { device -> drivers.find { it.id == device.driverId }?.let { Pair(device, it) } }
        .map { (device, driver) -> driver.powerOn(device.path) }
        .awaitAll()
    }

  override suspend fun powerOff(): Unit =
    withContext(Dispatchers.IO) {
      // Not optimal, but expected use cases shouldn't have many drivers and devices.
      // But this is easier to read and understand.
      val drivers = localDriverService.all()
      localDeviceService
        .all()
        .mapNotNull { device -> drivers.find { it.id == device.driverId }?.let { Pair(device, it) } }
        .map { (device, driver) -> driver.powerOff(device.path) }
        .awaitAll()
    }
}
