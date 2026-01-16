@file:OptIn(ExperimentalUuidApi::class)

package org.sleepingcats.bridgecmdr.common.service

import org.sleepingcats.bridgecmdr.common.service.model.Tie
import kotlin.uuid.ExperimentalUuidApi
import kotlin.uuid.Uuid

interface TieService {
  suspend fun all(): List<Tie>

  suspend fun findBySourceId(sourceId: Uuid): List<Tie>

  suspend fun findByDeviceId(deviceId: Uuid): List<Tie>

  suspend fun findBySourceAndDeviceId(
    sourceId: Uuid,
    deviceId: Uuid,
  ): List<Tie>

  suspend fun findById(id: Uuid): Tie

  suspend fun insert(payload: Tie.Payload): Tie

  suspend fun upsert(tie: Tie): Tie

  suspend fun updateById(
    id: Uuid,
    payload: Tie.Payload,
  ): Tie

  suspend fun partialUpdateById(
    id: Uuid,
    payload: Tie.Update,
  ): Tie

  suspend fun deleteById(id: Uuid): Tie
}
