package org.sleepingcats.bridgecmdr.common.protocol

import org.sleepingcats.bridgecmdr.common.protocol.stream.ProtocolStream
import org.sleepingcats.bridgecmdr.common.protocol.support.AbstractDriverProtocol

class ExtronSisProtocol : AbstractDriverProtocol("extron/sis") {
  private val stream = ProtocolStream.create(name)

  suspend fun sendCommand(
    uri: String,
    command: String,
  ) = stream.sendCommand(uri, command)

  override suspend fun sendActivate(
    uri: String,
    input: Int,
    videoOutput: Int,
    audioOutput: Int,
  ) {
    logger.info { "$name/tie($input, $videoOutput, $audioOutput) -> $uri" }
    val videoCommand = "$input*$videoOutput%"
    val audioCommand = "$input*$audioOutput$"
    sendCommand(uri, "$videoCommand\r\n$audioCommand\r\n")
  }
}
