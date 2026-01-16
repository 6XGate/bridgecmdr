@file:OptIn(ExperimentalUuidApi::class)

package org.sleepingcats.bridgecmdr.common.service

import org.sleepingcats.bridgecmdr.common.service.model.Source
import kotlin.uuid.ExperimentalUuidApi
import kotlin.uuid.Uuid

interface SourceService {
  suspend fun all(): List<Source>

  suspend fun findById(id: Uuid): Source

  suspend fun insert(payload: Source.Payload): Source

  suspend fun upsert(source: Source): Source

  suspend fun updateById(
    id: Uuid,
    payload: Source.Payload,
  ): Source

  suspend fun partialUpdateById(
    id: Uuid,
    payload: Source.Update,
  ): Source

  suspend fun deleteById(id: Uuid): Source

  suspend fun activateById(id: Uuid)
}
