package org.sleepingcats.bridgecmdr.common.protocol.support.sony

@JvmInline
value class Address private constructor(
  val byte: Byte,
) {
  companion object {
    fun create(
      kind: AddressKind,
      id: Int,
    ): Address {
      require(id in 0x00..0x1f) { "Address ID must be between 0x00 and 0x1f" }
      return Address((kind.byte.toInt() or id).toByte())
    }
  }
}
