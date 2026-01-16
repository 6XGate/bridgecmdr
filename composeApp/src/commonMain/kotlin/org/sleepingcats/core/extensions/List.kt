package org.sleepingcats.core.extensions

fun <T> List<T>.removingFirst(predicate: (T) -> Boolean): List<T> =
  this.indexOfFirst(predicate).let { index ->
    when {
      index >= 0 -> this.subList(0, index) + this.subList(index + 1, this.size)
      else -> this
    }
  }

fun <T> List<T>.upsertingFirst(
  newItem: T,
  predicate: (T) -> Boolean,
): List<T> =
  this.indexOfFirst(predicate).let { index ->
    when {
      index >= 0 -> this.subList(0, index) + newItem + this.subList(index + 1, this.size)
      else -> this + newItem
    }
  }

fun <T> List<T>.replacingFirst(
  newItem: T,
  predicate: (T) -> Boolean,
): List<T> =
  this.indexOfFirst(predicate).let { index ->
    when {
      index >= 0 -> this.subList(0, index) + newItem + this.subList(index + 1, this.size)
      else -> this
    }
  }
