package org.sleepingcats.bridgecmdr.common.protocol.support.sony

enum class AddressKind(
  val byte: Byte,
) {
  All(0xc0.toByte()),
  Group(0x80.toByte()),
  Monitor(0x00),
}
