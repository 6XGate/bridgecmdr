@file:OptIn(ExperimentalUuidApi::class)

package org.sleepingcats.bridgecmdr.ui.repository

import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import org.sleepingcats.bridgecmdr.common.service.SourceService
import org.sleepingcats.bridgecmdr.common.service.model.Source
import org.sleepingcats.bridgecmdr.ui.cache.SourceCache
import org.sleepingcats.bridgecmdr.ui.repository.core.DataRepository
import kotlin.uuid.ExperimentalUuidApi
import kotlin.uuid.Uuid

class SourceRepository(
  cache: SourceCache,
  private val service: SourceService,
) : DataRepository<Source, Uuid, SourceCache>(cache) {
  // Tracking here so we can keep up with it if the viewModel is released.
  private val _active = MutableStateFlow<Source?>(null)
  val active = _active.asStateFlow()

  override suspend fun refresh() =
    cache.refresh(service.all()).apply {
      _active.update { value -> if (value != null) this.find { it.id == value.id } else null }
    }

  override suspend fun add(item: Source) = cache.add(service.insert(Source.Payload(item)))

  override suspend fun upsert(item: Source) =
    cache.upsert(service.upsert(item)).apply {
      _active.update { value -> if (value?.id == item.id) this else value }
    }

  override suspend fun update(item: Source) =
    cache.update(service.updateById(item.id, Source.Payload(item))).apply {
      _active.update { value -> if (value?.id == item.id) this else value }
    }

  override suspend fun remove(item: Source) =
    cache.remove(service.deleteById(item.id)).apply {
      _active.update { value -> if (value?.id == item.id) null else value }
    }

  suspend fun activate(item: Source) {
    _active.update { item }
    service.activateById(item.id)
  }

  suspend fun partialUpdate(
    id: Uuid,
    updates: Source.Update,
  ) = cache.update(service.partialUpdateById(id, updates))
}
