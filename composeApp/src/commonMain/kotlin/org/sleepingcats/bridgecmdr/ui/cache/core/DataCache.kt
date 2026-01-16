@file:OptIn(ExperimentalCoroutinesApi::class)

package org.sleepingcats.bridgecmdr.ui.cache.core

import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.last
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.take
import kotlinx.coroutines.flow.update
import org.sleepingcats.core.extensions.removingFirst
import org.sleepingcats.core.extensions.replacingFirst
import org.sleepingcats.core.extensions.upsertingFirst
import kotlin.reflect.KProperty1

abstract class DataCache<T, K : Comparable<K>> {
  protected abstract val key: KProperty1<T, K>

  private val cache = MutableStateFlow(emptyList<T>())

  val items: StateFlow<List<T>> get() = cache.asStateFlow()

  private infix fun T.sameKeyAs(other: T): Boolean = key(this) == key(other)

  private infix fun T.hasKey(key: K): Boolean = key(this) == key

  fun refresh(newItems: List<T>): List<T> = newItems.apply { cache.update { newItems } }

  suspend fun latest(): List<T> = items.take(1).last()

  fun find(key: K): Flow<T?> = cache.map { items -> items.find { item -> item hasKey key } }

  suspend fun findLatest(key: K): T? = find(key).take(1).last()

  fun add(item: T): T = item.apply { cache.update { currentItems -> currentItems + item } }

  fun upsert(item: T): T = item.apply { cache.update { items -> items.upsertingFirst(item) { it sameKeyAs item } } }

  fun update(item: T): T = item.apply { cache.update { items -> items.replacingFirst(item) { it sameKeyAs item } } }

  fun remove(item: T): T = item.apply { cache.update { items -> items.removingFirst { it sameKeyAs item } } }
}
