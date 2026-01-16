@file:OptIn(ExperimentalUuidApi::class)

package org.sleepingcats.bridgecmdr.ui.repository

import org.sleepingcats.bridgecmdr.common.service.TieService
import org.sleepingcats.bridgecmdr.common.service.model.Source
import org.sleepingcats.bridgecmdr.common.service.model.Tie
import org.sleepingcats.bridgecmdr.ui.cache.TieCache
import org.sleepingcats.bridgecmdr.ui.repository.core.DataRepository
import kotlin.uuid.ExperimentalUuidApi
import kotlin.uuid.Uuid

class TieRepository(
  cache: TieCache,
  private val service: TieService,
) : DataRepository<Tie, Uuid, TieCache>(cache) {
  override suspend fun refresh() = cache.refresh(service.all())

  override suspend fun add(item: Tie) = cache.add(service.insert(Tie.Payload(item)))

  override suspend fun upsert(item: Tie) = cache.upsert(service.upsert(item))

  override suspend fun update(item: Tie) = cache.update(service.updateById(item.id, Tie.Payload(item)))

  override suspend fun remove(item: Tie) = cache.remove(service.deleteById(item.id))

  suspend fun refreshFromSource(source: Source): List<Tie> = cache.refresh(service.findBySourceId(source.id))
}
