package org.sleepingcats.bridgecmdr.test.driver.sony

import org.sleepingcats.bridgecmdr.common.protocol.support.sony.Address
import org.sleepingcats.bridgecmdr.common.protocol.support.sony.AddressKind.All
import org.sleepingcats.bridgecmdr.common.protocol.support.sony.AddressKind.Group
import org.sleepingcats.bridgecmdr.common.protocol.support.sony.AddressKind.Monitor
import org.sleepingcats.bridgecmdr.common.protocol.support.sony.Packet
import org.sleepingcats.bridgecmdr.common.protocol.support.sony.PacketError
import org.sleepingcats.bridgecmdr.common.protocol.support.sony.PacketType.Command
import kotlin.test.Test
import kotlin.test.assertContentEquals
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith
import org.sleepingcats.bridgecmdr.common.protocol.support.sony.Command as CommandPacket

class InternalSonyProtocolTest {
  @Test
  fun `good packet`() {
    assertContentEquals(
      Packet
        .create(Command, ByteArray(5).apply { fill(0) })
        .bytes,
      "02050000000000fb".hexToByteArray(),
    )
  }

  @Test
  fun `empty packet`() {
    assertFailsWith<PacketError> {
      Packet
        .create(Command, ByteArray(0))
        .bytes
    }
  }

  @Test
  fun `oversized packet`() {
    assertFailsWith<PacketError> {
      Packet
        .create(Command, ByteArray(256))
        .bytes
    }
  }

  @Test
  fun `addresses values`() {
    assertEquals(Address.create(All, 5).byte, "c5".hexToByte())
    assertEquals(Address.create(Group, 5).byte, "85".hexToByte())
    assertEquals(Address.create(Monitor, 5).byte, 5)
  }

  @Test
  fun `addresses values - input range`() {
    assertFailsWith<IllegalArgumentException> { Address.create(All, 128) }
    assertFailsWith<IllegalArgumentException> { Address.create(Group, 128) }
    assertFailsWith<IllegalArgumentException> { Address.create(Monitor, 128) }
    assertFailsWith<IllegalArgumentException> { Address.create(All, -128) }
    assertFailsWith<IllegalArgumentException> { Address.create(Group, -128) }
    assertFailsWith<IllegalArgumentException> { Address.create(Monitor, -128) }
  }

  @Test
  fun `command packets`() {
    val address = Address.create(All, 0xf)
    assertContentEquals(
      CommandPacket
        .createPacket(address, address, CommandPacket.PowerOn)
        .bytes,
      "0204cfcf293ef7".hexToByteArray(),
    )
    assertContentEquals(
      CommandPacket
        .createPacket(address, address, CommandPacket.PowerOn, 4)
        .bytes,
      "0205cfcf293e04f2".hexToByteArray(),
    )
    assertContentEquals(
      CommandPacket
        .createPacket(address, address, CommandPacket.PowerOn, 3, 2)
        .bytes,
      "0206cfcf293e0302f0".hexToByteArray(),
    )
  }

  @Test
  fun `command packets - input range`() {
    val address = Address.create(All, 0xf)
    assertFailsWith<IllegalArgumentException> {
      CommandPacket.createPacket(address, address, CommandPacket.PowerOn, -1)
    }
    assertFailsWith<IllegalArgumentException> {
      CommandPacket.createPacket(address, address, CommandPacket.PowerOn, 256)
    }
    assertFailsWith<IllegalArgumentException> {
      CommandPacket.createPacket(address, address, CommandPacket.PowerOn, 0, -1)
    }
    assertFailsWith<IllegalArgumentException> {
      CommandPacket.createPacket(address, address, CommandPacket.PowerOn, 0, 256)
    }
  }
}
