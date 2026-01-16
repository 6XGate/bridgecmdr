@file:OptIn(ExperimentalUuidApi::class)

package org.sleepingcats.bridgecmdr.common.service

import org.sleepingcats.bridgecmdr.common.service.model.Driver
import kotlin.uuid.ExperimentalUuidApi
import kotlin.uuid.Uuid

interface DriverService {
  suspend fun all(): List<Driver>

  suspend fun findById(id: Uuid): Driver
}
