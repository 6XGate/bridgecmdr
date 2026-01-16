package org.sleepingcats.bridgecmdr.common.protocol.support.sony

import kotlin.experimental.inv

@JvmInline
value class Packet private constructor(
  val bytes: ByteArray,
) {
  companion object {
    private fun calculateChecksum(bytes: ByteArray): Byte {
      val x = bytes.fold(0.toByte()) { acc, byte -> (acc + byte).toByte() }.inv()
      return (x - (bytes.size - 1)).toByte()
    }

    fun create(
      type: PacketType,
      bytes: ByteArray,
    ): Packet {
      if (bytes.isEmpty()) throw PacketError("Data cannot be empty")
      if (bytes.size > 255) throw PacketError("Data length cannot exceed 255 bytes")

      return Packet(byteArrayOf(type.byte) + bytes.size.toByte() + bytes + calculateChecksum(bytes))
    }
  }
}
