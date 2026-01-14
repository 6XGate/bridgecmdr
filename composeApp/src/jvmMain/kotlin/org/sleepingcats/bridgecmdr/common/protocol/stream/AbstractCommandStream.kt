package org.sleepingcats.bridgecmdr.common.protocol.stream

abstract class AbstractCommandStream : CommandStream {
  private val listeners =
    object {
      val data = mutableSetOf<(ByteArray) -> Unit>()
      val error = mutableSetOf<(Throwable) -> Unit>()
    }

  protected fun emitData(data: ByteArray) {
    listeners.data.forEach { listener -> listener(data) }
  }

  protected fun emitError(cause: Throwable) {
    listeners.error.forEach { listener -> listener(cause) }
  }

  override fun onData(listener: (ByteArray) -> Unit): () -> Unit {
    listeners.data.add(listener)
    return { listeners.data.remove(listener) }
  }

  override fun onError(listener: (Throwable) -> Unit): () -> Unit {
    listeners.error.add(listener)
    return { listeners.error.remove(listener) }
  }
}
