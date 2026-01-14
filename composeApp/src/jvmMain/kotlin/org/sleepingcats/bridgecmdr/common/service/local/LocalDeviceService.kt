@file:OptIn(ExperimentalUuidApi::class)

package org.sleepingcats.bridgecmdr.common.service.local

import io.ktor.server.plugins.BadRequestException
import io.ktor.server.plugins.NotFoundException
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.jetbrains.exposed.v1.core.eq
import org.jetbrains.exposed.v1.core.inList
import org.jetbrains.exposed.v1.jdbc.deleteWhere
import org.jetbrains.exposed.v1.jdbc.transactions.transaction
import org.jetbrains.exposed.v1.jdbc.upsertReturning
import org.koin.core.component.KoinComponent
import org.sleepingcats.bridgecmdr.common.service.DatabaseService
import org.sleepingcats.bridgecmdr.common.service.DeviceService
import org.sleepingcats.bridgecmdr.common.service.entity.DeviceEntity
import org.sleepingcats.bridgecmdr.common.service.model.Device
import org.sleepingcats.bridgecmdr.common.service.table.DevicesTable
import org.sleepingcats.bridgecmdr.common.service.table.TiesTable
import org.sleepingcats.core.ErrorHandler
import kotlin.uuid.ExperimentalUuidApi
import kotlin.uuid.Uuid
import kotlin.uuid.toJavaUuid
import kotlin.uuid.toKotlinUuid

private operator fun Device.Companion.invoke(entity: DeviceEntity): Device =
  Device(entity.id.value.toKotlinUuid(), entity.driverId.toKotlinUuid(), entity.title, entity.path)

class LocalDeviceService(
  private val databaseService: DatabaseService,
  private val localDriverService: LocalDriverService,
) : KoinComponent,
  DeviceService {
  override suspend fun all(): List<Device> =
    withContext(Dispatchers.IO) {
      transaction(databaseService.get()) {
        DeviceEntity.all().map { Device(it) }
      }
    }

  override suspend fun findById(id: Uuid): Device =
    withContext(Dispatchers.IO) {
      transaction(databaseService.get()) {
        DeviceEntity.findById(id.toJavaUuid())?.let { Device(it) }
          ?: throw NotFoundException("Device with ID $id not found")
      }
    }

  suspend fun findManyByIds(ids: List<Uuid>): List<Device> =
    withContext(Dispatchers.IO) {
      transaction(databaseService.get()) {
        DeviceEntity
          .find { DevicesTable.id inList ids.map { it.toJavaUuid() } }
          .map { Device(it) }
      }
    }

  suspend fun verifyById(
    id: Uuid,
    onError: ErrorHandler = { msg -> throw BadRequestException(msg) },
  ): Unit =
    withContext(Dispatchers.IO) {
      transaction(databaseService.get()) {
        if (DeviceEntity.count(DevicesTable.id eq id.toJavaUuid()) == 0L) {
          onError("Device with ID $id not found")
        }
      }
    }

  override suspend fun insert(payload: Device.Payload): Device =
    withContext(Dispatchers.IO) {
      // Ensure the driver exist.
      localDriverService.verifyById(payload.driverId)
      transaction(databaseService.get()) {
        DeviceEntity
          .new {
            driverId = payload.driverId.toJavaUuid()
            title = payload.title
            path = payload.path
          }.let { Device(it) }
      }
    }

  override suspend fun upsert(device: Device): Device =
    withContext(Dispatchers.IO) {
      localDriverService.verifyById(device.driverId)
      transaction(databaseService.get()) {
        val rows =
          DevicesTable.upsertReturning(
            where = { DevicesTable.id eq device.id.toJavaUuid() },
            onUpdate = {
              it[DevicesTable.driverId] = device.driverId.toJavaUuid()
              it[DevicesTable.title] = device.title
              it[DevicesTable.path] = device.path
            },
          ) {
            it[id] = device.id.toJavaUuid()
            it[driverId] = device.driverId.toJavaUuid()
            it[title] = device.title
            it[path] = device.path
          }

        rows
          .map { Device(DeviceEntity.wrapRow(it)) }
          .firstOrNull() ?: throw IllegalStateException("Failed to upsert Device with ID ${device.id}")
      }
    }

  override suspend fun updateById(
    id: Uuid,
    payload: Device.Payload,
  ): Device =
    withContext(Dispatchers.IO) {
      // Ensure the driver exist.
      localDriverService.verifyById(payload.driverId)
      transaction(databaseService.get()) {
        DeviceEntity
          .findByIdAndUpdate(id.toJavaUuid()) { device ->
            device.driverId = payload.driverId.toJavaUuid()
            device.title = payload.title
            device.path = payload.path
          }?.let { Device(it) } ?: throw NotFoundException("Device with ID $id not found")
      }
    }

  override suspend fun partialUpdateById(
    id: Uuid,
    payload: Device.Update,
  ): Device =
    withContext(Dispatchers.IO) {
      // Ensure the driver exist if updating it.
      payload.driverId?.let { localDriverService.verifyById(it) }
      transaction(databaseService.get()) {
        DeviceEntity
          .findByIdAndUpdate(id.toJavaUuid()) { device ->
            payload.driverId?.let { device.driverId = it.toJavaUuid() }
            payload.title?.let { device.title = it }
            payload.path?.let { device.path = it }
          }?.let { Device(it) } ?: throw NotFoundException("Device with ID $id not found")
      }
    }

  override suspend fun deleteById(id: Uuid): Device =
    withContext(Dispatchers.IO) {
      transaction(databaseService.get()) {
        TiesTable.deleteWhere { TiesTable.deviceId eq id.toJavaUuid() }
        DeviceEntity
          .findById(id.toJavaUuid())
          ?.apply { delete() }
          ?.let { Device(it) }
          ?: throw NotFoundException("Device with ID $id not found")
      }
    }
}
