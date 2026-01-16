package org.sleepingcats.bridgecmdr.common.protocol

import org.sleepingcats.bridgecmdr.common.protocol.stream.ProtocolStream
import org.sleepingcats.bridgecmdr.common.protocol.support.AbstractDriverProtocol

class ShinybowProtocol(
  version: Int,
) : AbstractDriverProtocol("shinybow/v$version.0") {
  private val stream = ProtocolStream.create(name)

  private val argRange by lazy {
    when (version) {
      2 -> 1..99
      3 -> 1..999
      else -> throw IllegalArgumentException("Unsupported Shinybow protocol version: $version")
    }
  }

  private val toArg: (input: Int) -> String by lazy {
    when (version) {
      2 -> { input -> input.toString().padStart(2, '0') }
      3 -> { input -> input.toString().padStart(3, '0') }
      else -> throw IllegalArgumentException("Unsupported Shinybow protocol version: $version")
    }
  }

  suspend fun sendCommand(
    uri: String,
    command: String,
  ) = stream.sendCommand(uri, command)

  override suspend fun sendPowerOn(uri: String) {
    logger.info { "$name/powerOn -> $uri" }
    sendCommand(uri, "POWER ${toArg(1)};\r\n")
  }

  override suspend fun sendPowerOff(uri: String) {
    logger.info { "$name/powerOff -> $uri" }
    sendCommand(uri, "POWER ${toArg(0)};\r\n")
  }

  override suspend fun sendActivate(
    uri: String,
    input: Int,
    videoOutput: Int,
    audioOutput: Int,
  ) {
    require(input in argRange) { "Input out of range ($argRange): $input" }
    require(videoOutput in argRange) { "Input out of range ($argRange): $input" }
    logger.info { "$name/tie($input, $videoOutput) -> $uri" }
    sendCommand(uri, "OUTPUT${toArg(videoOutput)} ${toArg(input)};\r\n")
  }
}
