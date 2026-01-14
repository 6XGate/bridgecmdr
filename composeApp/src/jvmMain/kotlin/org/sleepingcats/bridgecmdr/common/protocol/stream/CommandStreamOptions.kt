package org.sleepingcats.bridgecmdr.common.protocol.stream

data class CommandStreamOptions(
  val baudRate: Int,
  val dataBits: DataBits,
  val stopBits: StopBits,
  val parity: Parity,
  val timeout: Int,
)
