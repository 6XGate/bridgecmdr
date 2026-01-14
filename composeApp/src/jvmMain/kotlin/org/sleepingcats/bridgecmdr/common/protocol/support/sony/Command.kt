package org.sleepingcats.bridgecmdr.common.protocol.support.sony

enum class Command(
  val bytes: ByteArray,
) {
  SetChannel(0x2100),
  PowerOn(0x293e),
  PowerOff(0x2a3e),
  PressButton(0x3f44),
  ;

  companion object {
    fun createPacket(
      destination: Address,
      source: Address,
      command: Command,
      arg0: Int?,
      arg1: Int?,
    ): Packet {
      require(arg0 == null || (arg0 in 0x00..0xff)) { "arg0 must be between 0x00 and 0xff" }
      require(arg1 == null || (arg1 in 0x00..0xff)) { "arg1 must be between 0x00 and 0xff" }

      val bytes = byteArrayOf(destination.byte) + source.byte + command.bytes
      if (arg0 == null) return Packet.create(PacketType.Command, bytes)
      if (arg1 == null) return Packet.create(PacketType.Command, bytes + arg0.toByte())
      return Packet.create(PacketType.Command, bytes + arg0.toByte() + arg1.toByte())
    }
  }

  constructor(code: Short) : this(toByteArray(code))
}

private fun toByteArray(code: Short): ByteArray =
  byteArrayOf(
    (code.toInt() shr 8).toByte(),
    (code.toInt() and 0xff).toByte(),
  )
