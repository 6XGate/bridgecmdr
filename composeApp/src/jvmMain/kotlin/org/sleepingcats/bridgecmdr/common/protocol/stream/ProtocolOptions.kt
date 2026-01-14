package org.sleepingcats.bridgecmdr.common.protocol.stream

open class ProtocolOptions(
  val baudRate: Int? = null,
  val dataBits: DataBits? = null,
  val stopBits: StopBits? = null,
  val parity: Parity? = null,
  val timeout: Int? = null,
) {
  companion object : ProtocolOptions()

  fun orTheseDefaults(
    baudRate: Int,
    dataBits: DataBits,
    stopBits: StopBits,
    parity: Parity,
    timeout: Int,
  ): CommandStreamOptions =
    CommandStreamOptions(
      baudRate = this.baudRate ?: baudRate,
      dataBits = this.dataBits ?: dataBits,
      stopBits = this.stopBits ?: stopBits,
      parity = this.parity ?: parity,
      timeout = this.timeout ?: timeout,
    )
}
