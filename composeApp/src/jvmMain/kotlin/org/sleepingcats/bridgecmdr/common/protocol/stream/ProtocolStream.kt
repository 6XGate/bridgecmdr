package org.sleepingcats.bridgecmdr.common.protocol.stream

import io.github.oshai.kotlinlogging.KLogger
import io.github.oshai.kotlinlogging.Marker
import org.koin.core.component.KoinComponent
import org.koin.core.component.get
import java.nio.charset.Charset

class ProtocolStream(
  val name: String,
  private val logger: KLogger,
  private val options: CommandStreamOptions,
) : KoinComponent {
  companion object : KoinComponent {
    fun create(
      name: String,
      logger: KLogger = get(),
      options: ProtocolOptions = ProtocolOptions,
    ) = ProtocolStream(
      name = name,
      logger = logger,
      options =
        options.orTheseDefaults(
          baudRate = 9600,
          dataBits = DataBits.Eight,
          stopBits = StopBits.One,
          parity = Parity.None,
          timeout = 5000,
        ),
    )
  }

  private val marker =
    object : Marker {
      override fun getName() = name
    }

  suspend fun sendCommand(
    uri: String,
    data: ByteArray,
  ) {
    val stream = CommandStream.create(uri, options)
    stream.use {
      stream.onData { data ->
        logger.debug(throwable = null, marker) { "Received data: ${data.decodeToString()}" }
      }
      stream.onError { throwable ->
        logger.error(throwable, marker) { "Error in command stream" }
      }

      stream.write(data)
    }
  }

  suspend fun sendCommand(
    uri: String,
    data: String,
    charset: Charset = Charsets.US_ASCII,
  ) {
    sendCommand(uri, data.toByteArray(charset))
  }
}
