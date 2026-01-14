package org.sleepingcats.bridgecmdr.common.protocol.support.sony

enum class PacketType(
  val byte: Byte,
) {
  Command(0x02),
}
