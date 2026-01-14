package org.sleepingcats.bridgecmdr.common.protocol

import org.sleepingcats.bridgecmdr.common.protocol.stream.ProtocolStream
import org.sleepingcats.bridgecmdr.common.protocol.support.AbstractDriverProtocol

class TeslaElecMatrixProtocol : AbstractDriverProtocol("teslaElec/matrix") {
  private val stream = ProtocolStream.create(name)

  private fun toArg(input: Int) = input.toString().padStart(2, '0')

  private suspend fun sendCommand(
    uri: String,
    command: String,
  ) = stream.sendCommand(uri, command)

  override suspend fun sendActivate(
    uri: String,
    input: Int,
    videoOutput: Int,
    audioOutput: Int,
  ) {
    check(input in 1..99) { "Input out of range (1..99): $input" }
    check(videoOutput in 1..99) { "Input out of range (1..99): $input" }
    logger.info { "$name/tie($input, $videoOutput) -> $uri" }
    sendCommand(uri, "MT00SW${toArg(input)}${toArg(videoOutput)}NT/r/n")
  }
}
