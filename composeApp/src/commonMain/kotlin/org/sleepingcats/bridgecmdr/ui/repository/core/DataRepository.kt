package org.sleepingcats.bridgecmdr.ui.repository.core

import org.sleepingcats.bridgecmdr.ui.cache.core.DataCache

abstract class DataRepository<T, K : Comparable<K>, C : DataCache<T, K>>(
  cache: C,
) : CachingRepository<T, K, C>(cache) {
  abstract suspend fun add(item: T): T

  abstract suspend fun upsert(item: T): T

  abstract suspend fun update(item: T): T

  abstract suspend fun remove(item: T): T
}
