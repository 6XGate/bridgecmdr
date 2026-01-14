@file:OptIn(ExperimentalUuidApi::class)

package org.sleepingcats.bridgecmdr.common.service.local

import io.ktor.server.plugins.NotFoundException
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.jetbrains.exposed.v1.core.and
import org.jetbrains.exposed.v1.core.eq
import org.jetbrains.exposed.v1.jdbc.transactions.transaction
import org.jetbrains.exposed.v1.jdbc.upsertReturning
import org.koin.core.component.KoinComponent
import org.sleepingcats.bridgecmdr.common.service.DatabaseService
import org.sleepingcats.bridgecmdr.common.service.TieService
import org.sleepingcats.bridgecmdr.common.service.entity.TieEntity
import org.sleepingcats.bridgecmdr.common.service.model.Tie
import org.sleepingcats.bridgecmdr.common.service.table.TiesTable
import kotlin.uuid.ExperimentalUuidApi
import kotlin.uuid.Uuid
import kotlin.uuid.toJavaUuid
import kotlin.uuid.toKotlinUuid

private operator fun Tie.Companion.invoke(entity: TieEntity): Tie =
  Tie(
    entity.id.value.toKotlinUuid(),
    entity.sourceId.toKotlinUuid(),
    entity.deviceId.toKotlinUuid(),
    entity.inputChannel,
    entity.outputVideoChannel,
    entity.outputAudioChannel,
  )

class LocalTieService(
  private val databaseService: DatabaseService,
  private val localDeviceService: LocalDeviceService,
  private val localSourceService: LocalSourceService,
) : KoinComponent,
  TieService {
  override suspend fun all(): List<Tie> =
    withContext(Dispatchers.IO) {
      transaction(databaseService.get()) {
        TieEntity.all().map { Tie(it) }
      }
    }

  override suspend fun findById(id: Uuid): Tie =
    withContext(Dispatchers.IO) {
      transaction(databaseService.get()) {
        TieEntity.findById(id.toJavaUuid())?.let { Tie(it) }
          ?: throw NotFoundException("Tie with ID $id not found")
      }
    }

  override suspend fun findBySourceId(sourceId: Uuid): List<Tie> =
    withContext(Dispatchers.IO) {
      transaction(databaseService.get()) {
        TieEntity
          .find { TiesTable.sourceId eq sourceId.toJavaUuid() }
          .map { Tie(it) }
      }
    }

  override suspend fun findByDeviceId(deviceId: Uuid): List<Tie> =
    withContext(Dispatchers.IO) {
      transaction(databaseService.get()) {
        TieEntity
          .find { TiesTable.deviceId eq deviceId.toJavaUuid() }
          .map { Tie(it) }
      }
    }

  override suspend fun findBySourceAndDeviceId(
    sourceId: Uuid,
    deviceId: Uuid,
  ): List<Tie> =
    withContext(Dispatchers.IO) {
      transaction(databaseService.get()) {
        TieEntity
          .find { (TiesTable.sourceId eq sourceId.toJavaUuid()) and (TiesTable.deviceId eq deviceId.toJavaUuid()) }
          .map { Tie(it) }
      }
    }

  override suspend fun insert(payload: Tie.Payload): Tie =
    withContext(Dispatchers.IO) {
      localDeviceService.verifyById(payload.deviceId)
      localSourceService.verifyById(payload.sourceId)
      transaction(databaseService.get()) {
        TieEntity
          .new {
            sourceId = payload.sourceId.toJavaUuid()
            deviceId = payload.deviceId.toJavaUuid()
            inputChannel = payload.inputChannel
            outputVideoChannel = payload.outputVideoChannel
            outputAudioChannel = payload.outputAudioChannel
          }.let { Tie(it) }
      }
    }

  override suspend fun upsert(tie: Tie): Tie =
    withContext(Dispatchers.IO) {
      localDeviceService.verifyById(tie.deviceId)
      localSourceService.verifyById(tie.sourceId)
      transaction(databaseService.get()) {
        val rows =
          TiesTable.upsertReturning(
            where = { TiesTable.id eq tie.id.toJavaUuid() },
            onUpdate = {
              it[TiesTable.sourceId] = tie.sourceId.toJavaUuid()
              it[TiesTable.deviceId] = tie.deviceId.toJavaUuid()
              it[TiesTable.inputChannel] = tie.inputChannel
              it[TiesTable.outputVideoChannel] = tie.outputVideoChannel
              it[TiesTable.outputAudioChannel] = tie.outputAudioChannel
            },
          ) {
            it[id] = tie.id.toJavaUuid()
            it[sourceId] = tie.sourceId.toJavaUuid()
            it[deviceId] = tie.deviceId.toJavaUuid()
            it[inputChannel] = tie.inputChannel
            it[outputVideoChannel] = tie.outputVideoChannel
            it[outputAudioChannel] = tie.outputAudioChannel
          }

        rows
          .map { Tie(TieEntity.wrapRow(it)) }
          .firstOrNull() ?: throw IllegalStateException("Failed to upsert Tie with ID ${tie.id}")
      }
    }

  override suspend fun updateById(
    id: Uuid,
    payload: Tie.Payload,
  ): Tie =
    withContext(Dispatchers.IO) {
      localDeviceService.verifyById(payload.deviceId)
      localSourceService.verifyById(payload.sourceId)
      transaction(databaseService.get()) {
        TieEntity
          .findByIdAndUpdate(id.toJavaUuid()) { entity ->
            entity.sourceId = payload.sourceId.toJavaUuid()
            entity.deviceId = payload.deviceId.toJavaUuid()
            entity.inputChannel = payload.inputChannel
            entity.outputVideoChannel = payload.outputVideoChannel
            entity.outputAudioChannel = payload.outputAudioChannel
          }?.let { Tie(it) } ?: throw NotFoundException("Tie with ID $id not found")
      }
    }

  override suspend fun partialUpdateById(
    id: Uuid,
    payload: Tie.Update,
  ): Tie =
    withContext(Dispatchers.IO) {
      payload.deviceId?.let { localDeviceService.verifyById(it) }
      payload.sourceId?.let { localSourceService.verifyById(it) }
      transaction(databaseService.get()) {
        TieEntity
          .findByIdAndUpdate(id.toJavaUuid()) { entity ->
            payload.sourceId?.let { entity.sourceId = it.toJavaUuid() }
            payload.deviceId?.let { entity.deviceId = it.toJavaUuid() }
            payload.inputChannel?.let { entity.inputChannel = it }
            payload.outputVideoChannel?.let { entity.outputVideoChannel = it }
            payload.outputAudioChannel?.let { entity.outputAudioChannel = it }
          }?.let { Tie(it) } ?: throw NotFoundException("Tie with ID $id not found")
      }
    }

  override suspend fun deleteById(id: Uuid): Tie =
    withContext(Dispatchers.IO) {
      transaction(databaseService.get()) {
        TieEntity
          .findById(id.toJavaUuid())
          ?.apply { delete() }
          ?.let { Tie(it) }
          ?: throw NotFoundException("Tie with ID $id not found")
      }
    }
}
