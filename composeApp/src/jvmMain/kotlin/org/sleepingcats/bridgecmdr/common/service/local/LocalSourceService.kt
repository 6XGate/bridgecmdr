@file:OptIn(ExperimentalUuidApi::class, ExperimentalUuidApi::class)

package org.sleepingcats.bridgecmdr.common.service.local

import io.ktor.server.plugins.BadRequestException
import io.ktor.server.plugins.NotFoundException
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.awaitAll
import kotlinx.coroutines.withContext
import org.jetbrains.exposed.v1.core.eq
import org.jetbrains.exposed.v1.jdbc.deleteWhere
import org.jetbrains.exposed.v1.jdbc.transactions.transaction
import org.jetbrains.exposed.v1.jdbc.upsertReturning
import org.koin.core.component.KoinComponent
import org.koin.core.component.inject
import org.sleepingcats.bridgecmdr.common.service.DatabaseService
import org.sleepingcats.bridgecmdr.common.service.SourceService
import org.sleepingcats.bridgecmdr.common.service.entity.SourceEntity
import org.sleepingcats.bridgecmdr.common.service.model.Source
import org.sleepingcats.bridgecmdr.common.service.table.SourcesTable
import org.sleepingcats.bridgecmdr.common.service.table.TiesTable
import org.sleepingcats.core.ErrorHandler
import kotlin.uuid.ExperimentalUuidApi
import kotlin.uuid.Uuid
import kotlin.uuid.toJavaUuid
import kotlin.uuid.toKotlinUuid

private operator fun Source.Companion.invoke(entity: SourceEntity): Source =
  Source(entity.id.value.toKotlinUuid(), entity.title, entity.image?.toKotlinUuid())

class LocalSourceService(
  private val databaseService: DatabaseService,
  private val localUserImageService: LocalUserImageService,
  private val localDriverService: LocalDriverService,
) : KoinComponent,
  SourceService {
  private val localDeviceService: LocalDeviceService by inject()
  private val localTieService: LocalTieService by inject()

  override suspend fun all(): List<Source> =
    withContext(Dispatchers.IO) {
      transaction(databaseService.get()) {
        SourceEntity.all().map { Source(it) }
      }
    }

  override suspend fun findById(id: Uuid): Source =
    withContext(Dispatchers.IO) {
      transaction(databaseService.get()) {
        SourceEntity.findById(id.toJavaUuid())?.let { Source(it) }
          ?: throw NotFoundException("Source with ID $id not found")
      }
    }

  suspend fun verifyById(
    id: Uuid,
    onError: ErrorHandler = { msg -> throw BadRequestException(msg) },
  ): Unit =
    withContext(Dispatchers.IO) {
      transaction(databaseService.get()) {
        if (SourceEntity.count(SourcesTable.id eq id.toJavaUuid()) == 0L) {
          onError("Source with ID $id not found")
        }
      }
    }

  override suspend fun insert(payload: Source.Payload): Source =
    withContext(Dispatchers.IO) {
      payload.image?.let { localUserImageService.verifyById(it) }
      transaction(databaseService.get()) {
        SourceEntity
          .new {
            title = payload.title
            image = payload.image?.toJavaUuid()
          }.let { Source(it) }
      }
    }

  override suspend fun upsert(source: Source): Source =
    withContext(Dispatchers.IO) {
      source.image?.let { localUserImageService.verifyById(it) }
      transaction(databaseService.get()) {
        val rows =
          SourcesTable
            .upsertReturning(
              where = { SourcesTable.id eq source.id.toJavaUuid() },
              onUpdate = {
                it[SourcesTable.title] = source.title
                it[SourcesTable.image] = source.image?.toJavaUuid()
              },
            ) {
              it[id] = source.id.toJavaUuid()
              it[title] = source.title
              it[image] = source.image?.toJavaUuid()
            }

        rows
          .map { Source(SourceEntity.wrapRow(it)) }
          .firstOrNull() ?: throw IllegalStateException("Failed to upsert Source with ID ${source.id}")
      }
    }

  override suspend fun updateById(
    id: Uuid,
    payload: Source.Payload,
  ): Source =
    withContext(Dispatchers.IO) {
      payload.image?.let { localUserImageService.verifyById(it) }
      transaction(databaseService.get()) {
        SourceEntity
          .findByIdAndUpdate(id.toJavaUuid()) { source ->
            source.title = payload.title
            source.image = payload.image?.toJavaUuid()
          }?.let { Source(it) } ?: throw NotFoundException("Source with ID $id not found")
      }
    }

  override suspend fun partialUpdateById(
    id: Uuid,
    payload: Source.Update,
  ): Source =
    withContext(Dispatchers.IO) {
      payload.image?.let { localUserImageService.verifyById(it) }
      transaction(databaseService.get()) {
        SourceEntity
          .findByIdAndUpdate(id.toJavaUuid()) { source ->
            payload.title?.let { source.title = it }
            payload.image?.let { source.image = it.toJavaUuid() }
          }?.let { Source(it) } ?: throw NotFoundException("Source with ID $id not found")
      }
    }

  override suspend fun deleteById(id: Uuid): Source =
    withContext(Dispatchers.IO) {
      // NOTE: We don't delete the associated image in case another source is using it.
      transaction(databaseService.get()) {
        TiesTable.deleteWhere { TiesTable.sourceId eq id.toJavaUuid() }
        SourceEntity
          .findById(id.toJavaUuid())
          ?.apply { delete() }
          ?.let { Source(it) }
          ?: throw NotFoundException("Source with ID $id not found")
      }
    }

  override suspend fun activateById(id: Uuid): Unit =
    withContext(Dispatchers.IO) {
      verifyById(id) { msg -> throw NotFoundException(msg) }

      // Not optimal, but expected use cases shouldn't have many drivers, devices, and ties.
      // But this is easier to read and understand.

      val devices = localDeviceService.all()
      val drivers = localDriverService.all()
      localTieService
        .findBySourceId(id)
        .mapNotNull { tie -> devices.find { it.id == tie.deviceId }?.let { Pair(tie, it) } }
        .mapNotNull { (tie, device) -> drivers.find { it.id == device.driverId }?.let { Triple(tie, device, it) } }
        .map { (tie, device, driver) ->
          driver.activate(
            device.path,
            tie.inputChannel,
            tie.outputVideoChannel ?: tie.inputChannel,
            tie.outputAudioChannel ?: tie.outputVideoChannel ?: tie.inputChannel,
          )
        }.awaitAll()
    }
}
