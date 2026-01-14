package org.sleepingcats.bridgecmdr.common.protocol

import org.sleepingcats.bridgecmdr.common.protocol.stream.ProtocolStream
import org.sleepingcats.bridgecmdr.common.protocol.support.AbstractDriverProtocol

class TeslaElecSdiProtocol : AbstractDriverProtocol("teslaElec/sdi") {
  private val stream = ProtocolStream.create(name)

  private suspend fun sendCommand(
    uri: String,
    command: ByteArray,
  ) = stream.sendCommand(uri, command)

  override suspend fun sendActivate(
    uri: String,
    input: Int,
    videoOutput: Int,
    audioOutput: Int,
  ) {
    check(input in 1..255) { "Input out of range (1..255): $input" }
    logger.info { "$name/channel($input) -> $uri" }
    sendCommand(uri, byteArrayOf(0xaa.toByte(), 0xcc.toByte(), 0x01, input.toByte(), 0xee.toByte()))
  }
}
