@file:OptIn(ExperimentalUuidApi::class)

package org.sleepingcats.bridgecmdr.common.service.local

import io.ktor.server.plugins.BadRequestException
import io.ktor.server.plugins.NotFoundException
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.koin.core.component.KoinComponent
import org.sleepingcats.bridgecmdr.common.core.DriverModule
import org.sleepingcats.bridgecmdr.common.driver.extron.ExtronSisDriver
import org.sleepingcats.bridgecmdr.common.driver.shinybow.ShinybowVersion2Driver
import org.sleepingcats.bridgecmdr.common.driver.shinybow.ShinybowVersion3Driver
import org.sleepingcats.bridgecmdr.common.driver.sony.SonyRs485Driver
import org.sleepingcats.bridgecmdr.common.driver.teslasmart.TeslaSmartKvmDriver
import org.sleepingcats.bridgecmdr.common.driver.teslasmart.TeslaSmartMatrixDriver
import org.sleepingcats.bridgecmdr.common.driver.teslasmart.TeslaSmartSdiDriver
import org.sleepingcats.bridgecmdr.common.driver.tesmart.TeSmartSmartKvmDriver
import org.sleepingcats.bridgecmdr.common.driver.tesmart.TeSmartSmartMatrixDriver
import org.sleepingcats.bridgecmdr.common.driver.tesmart.TeSmartSmartSdiDriver
import org.sleepingcats.bridgecmdr.common.service.DriverService
import org.sleepingcats.core.ErrorHandler
import org.sleepingcats.core.memoizeSuspend
import kotlin.uuid.ExperimentalUuidApi
import kotlin.uuid.Uuid

class LocalDriverService :
  KoinComponent,
  DriverService {
  private val drivers =
    memoizeSuspend {
      listOf(
        ExtronSisDriver(),
        ShinybowVersion2Driver(),
        ShinybowVersion3Driver(),
        SonyRs485Driver(),
        TeslaSmartKvmDriver(),
        TeslaSmartMatrixDriver(),
        TeslaSmartSdiDriver(),
        TeSmartSmartKvmDriver(),
        TeSmartSmartMatrixDriver(),
        TeSmartSmartSdiDriver(),
      )
    }

  private val index =
    memoizeSuspend {
      drivers().associateBy { it.id }
    }

  override suspend fun all(): List<DriverModule> = withContext(Dispatchers.IO) { drivers() }

  override suspend fun findById(id: Uuid): DriverModule =
    findByIdOrNull(id) ?: throw NotFoundException("Drive with ID $id not found")

  suspend fun findByIdOrNull(id: Uuid): DriverModule? = index()[id]

  suspend fun verifyById(
    id: Uuid,
    onError: ErrorHandler = { msg -> throw BadRequestException(msg) },
  ) {
    if (!index().containsKey(id)) onError("Driver with ID $id not found")
  }
}
