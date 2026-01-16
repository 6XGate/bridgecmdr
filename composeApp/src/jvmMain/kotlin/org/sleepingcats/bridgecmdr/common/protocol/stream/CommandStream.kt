package org.sleepingcats.bridgecmdr.common.protocol.stream

import com.fazecast.jSerialComm.SerialPort
import com.fazecast.jSerialComm.SerialPort.TIMEOUT_READ_SEMI_BLOCKING
import com.fazecast.jSerialComm.SerialPort.TIMEOUT_WRITE_BLOCKING
import io.ktor.network.selector.SelectorManager
import io.ktor.network.sockets.aSocket
import kotlinx.coroutines.Dispatchers
import org.sleepingcats.bridgecmdr.common.service.model.PathType
import java.nio.charset.Charset

interface CommandStream : AutoCloseable {
  companion object {
    val selector = SelectorManager(Dispatchers.IO)

    val hostWithOptionalPortPattern = Regex("^((\\[[A-Fa-f0-9.:]+])|([\\p{N}\\p{L}.-]+))(?::([1-9][0-9]*))?$")

    private fun createSerial(
      path: String,
      options: CommandStreamOptions,
    ): CommandStream {
      val port =
        SerialPort.getCommPorts().find { it.systemPortPath == path }
          ?: throw IllegalArgumentException("Unknown path: $path")

      port.baudRate = options.baudRate
      port.numDataBits = options.dataBits.value
      port.numStopBits = options.stopBits.value
      port.parity = options.parity.value
      port.setComPortTimeouts(TIMEOUT_READ_SEMI_BLOCKING or TIMEOUT_WRITE_BLOCKING, options.timeout, options.timeout)

      return SerialCommandStream(port)
    }

    private suspend fun createNet(
      hostname: String,
      options: CommandStreamOptions,
    ): CommandStream {
      val matches = hostWithOptionalPortPattern.matchEntire(hostname)
      val host = matches?.groupValues?.getOrNull(0) ?: throw IllegalArgumentException("Unknown host: $hostname")
      val port = matches.groupValues.getOrNull(1)?.toIntOrNull() ?: 23

      val socket = aSocket(selector).tcp().connect(host, port)
      return NetCommandStream(socket)
    }

    suspend fun create(
      path: String,
      options: CommandStreamOptions,
    ): CommandStream =
      when {
        path.startsWith(PathType.Remote.prefix) -> createNet(path.substring(PathType.Remote.prefix.length), options)
        path.startsWith(PathType.Port.prefix) -> createSerial(path.substring(PathType.Port.prefix.length), options)
        else -> throw IllegalArgumentException("Unknown path $path")
      }
  }

  suspend fun write(data: ByteArray): Int

  suspend fun write(
    data: String,
    charset: Charset = Charsets.US_ASCII,
  ): Int = write(data.toByteArray(charset))

  fun onData(listener: (ByteArray) -> Unit): () -> Unit

  fun onError(listener: (Throwable) -> Unit): () -> Unit
}
