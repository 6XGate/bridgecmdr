package org.sleepingcats.bridgecmdr.common.protocol

import org.sleepingcats.bridgecmdr.common.protocol.stream.Parity
import org.sleepingcats.bridgecmdr.common.protocol.stream.ProtocolOptions
import org.sleepingcats.bridgecmdr.common.protocol.stream.ProtocolStream
import org.sleepingcats.bridgecmdr.common.protocol.support.AbstractDriverProtocol
import org.sleepingcats.bridgecmdr.common.protocol.support.sony.Address
import org.sleepingcats.bridgecmdr.common.protocol.support.sony.AddressKind
import org.sleepingcats.bridgecmdr.common.protocol.support.sony.Command

class SonyProtocol : AbstractDriverProtocol("sony/bvm") {
  private val stream =
    ProtocolStream.create(
      name,
      options =
        ProtocolOptions(
          baudRate = 38400,
          parity = Parity.Odd,
        ),
    )

  private suspend fun sendCommand(
    uri: String,
    command: Command,
    arg0: Int? = null,
    arg1: Int? = null,
  ) {
    val packet =
      Command.createPacket(
        destination = Address.create(AddressKind.All, 0),
        source = Address.create(AddressKind.All, 0),
        command = command,
        arg0 = arg0,
        arg1 = arg1,
      )
    stream.sendCommand(uri, packet.bytes)
  }

  override suspend fun sendPowerOn(uri: String) {
    logger.info { "$name/powerOn -> $uri" }
    sendCommand(uri, Command.PowerOn)
  }

  override suspend fun sendPowerOff(uri: String) {
    logger.info { "$name/powerOff -> $uri" }
    sendCommand(uri, Command.PowerOff)
  }

  override suspend fun sendActivate(
    uri: String,
    input: Int,
    videoOutput: Int,
    audioOutput: Int,
  ) {
    check(input in 1..255) { "Input out of range (1..255): $input" }
    logger.info { "$name/channel($input) -> $uri" }
    sendCommand(uri, Command.SetChannel, input)
  }
}
