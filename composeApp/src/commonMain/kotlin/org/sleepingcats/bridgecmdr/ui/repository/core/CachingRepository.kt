package org.sleepingcats.bridgecmdr.ui.repository.core

import org.sleepingcats.bridgecmdr.ui.cache.core.DataCache

abstract class CachingRepository<T, K : Comparable<K>, C : DataCache<T, K>>(
  protected val cache: C,
) {
  val items = cache.items

  suspend fun latest() = cache.latest()

  fun find(key: K) = cache.find(key)

  suspend fun findLatest(key: K) = cache.findLatest(key)

  abstract suspend fun refresh(): List<T>
}
