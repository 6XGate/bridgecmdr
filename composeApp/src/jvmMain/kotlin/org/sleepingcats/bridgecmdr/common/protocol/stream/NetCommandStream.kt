package org.sleepingcats.bridgecmdr.common.protocol.stream

import io.ktor.network.sockets.Socket
import io.ktor.network.sockets.openReadChannel
import io.ktor.network.sockets.openWriteChannel
import io.ktor.utils.io.asByteWriteChannel
import io.ktor.utils.io.copyTo
import io.ktor.utils.io.core.readFully
import io.ktor.utils.io.writeByteArray
import kotlinx.coroutines.launch
import kotlinx.io.Buffer
import kotlinx.io.RawSink

class NetCommandStream(
  private val socket: Socket,
) : AbstractCommandStream() {
  private val readChannel = socket.openReadChannel()
  private val writeChannel = socket.openWriteChannel()

  private class EventProxy(
    private val emitter: (ByteArray) -> Unit,
  ) : RawSink {
    override fun write(
      source: Buffer,
      byteCount: Long,
    ) {
      if (byteCount > Int.MAX_VALUE) throw IllegalArgumentException("byteCount too large: $byteCount")
      val buffer = ByteArray(byteCount.toInt())
      source.readFully(buffer)

      emitter(buffer)
    }

    override fun flush() {
      // Does nothing here.
    }

    override fun close() {
      // Does nothing here.
    }
  }

  init {
    val proxy = EventProxy(emitter = { data -> emitData(data) })
    socket.launch { readChannel.copyTo(proxy.asByteWriteChannel()) }
  }

  override suspend fun write(data: ByteArray): Int {
    writeChannel.writeByteArray(data)
    return data.size
  }

  override fun close() {
    socket.close()
  }
}
