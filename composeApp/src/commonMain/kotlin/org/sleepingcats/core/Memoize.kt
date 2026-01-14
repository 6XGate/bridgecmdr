package org.sleepingcats.core

import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock

inline fun <reified R> memoize(noinline func: () -> R): () -> R {
  var cache: R? = null
  return {
    cache ?: func().also {
      @Suppress("AssignedValueIsNeverRead") // Used in subsequent calls
      cache = it
    }
  }
}

inline fun <reified R> memoizeSuspend(noinline func: suspend () -> R): suspend () -> R {
  val mutex = Mutex()
  var cache: R? = null
  return {
    mutex.withLock {
      cache ?: func().also {
        @Suppress("AssignedValueIsNeverRead") // Used in subsequent calls
        cache = it
      }
    }
  }
}

fun <T, R> cache(
  by: ((T) -> Any?) = { it.toString() },
  func: (T) -> R,
): (T) -> R {
  val cache = mutableMapOf<Any?, R>()
  return { arg -> by(arg).let { key -> cache[key] ?: func(arg).also { cache[key] = it } } }
}

fun <T, R> cacheSuspend(
  by: ((T) -> Any?) = { it.toString() },
  func: suspend (T) -> R,
): suspend (T) -> R {
  val mutex = Mutex()
  val cache = mutableMapOf<Any?, R>()
  return { arg -> mutex.withLock { by(arg).let { key -> cache[key] ?: func(arg).also { cache[key] = it } } } }
}
