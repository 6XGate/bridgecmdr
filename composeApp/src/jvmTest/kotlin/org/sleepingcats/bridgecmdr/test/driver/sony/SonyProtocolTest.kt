package org.sleepingcats.bridgecmdr.test.driver.sony

import io.github.oshai.kotlinlogging.KotlinLogging
import io.mockk.coEvery
import io.mockk.coVerify
import io.mockk.every
import io.mockk.impl.annotations.MockK
import io.mockk.junit4.MockKRule
import io.mockk.mockkObject
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.runBlocking
import org.junit.Rule
import org.koin.dsl.module
import org.koin.test.KoinTestRule
import org.sleepingcats.bridgecmdr.common.protocol.SonyProtocol
import org.sleepingcats.bridgecmdr.common.protocol.stream.ProtocolStream
import kotlin.test.Test
import kotlin.test.assertFailsWith

class SonyProtocolTest {
  @get:Rule
  val mockRule = MockKRule(this)

  @get:Rule
  val koinTestRule =
    KoinTestRule.create {
      printLogger()
      modules(
        module {
          single { KotlinLogging.logger {} }
        },
      )
    }

  init {
    mockkObject(ProtocolStream.Companion)
  }

  @MockK
  lateinit var stream: ProtocolStream

  @Test
  fun `power on`() =
    runBlocking(Dispatchers.Unconfined) {
      every { ProtocolStream.create(any(), any(), any()) } returns stream
      coEvery { stream.sendCommand("ip:test", any<ByteArray>()) } returns Unit
      val commandBytes = "0204c0c0293e15".hexToByteArray()
      val protocol = SonyProtocol()

      protocol.powerOn("ip:test").await()

      // Packet type: Command == 0x02
      // Packet contents length: 4
      // Command packet:
      //   Destination: All monitors == 0xc0 OR Address == 0; => 0xc0
      //   Source: All monitors == 0xc0 OR Address == 0; => 0xc0
      //   Command: PowerOn == 0x293e (in BE)
      // Checksum: 0x15
      coVerify { stream.sendCommand("ip:test", commandBytes) }
    }

  @Test
  fun `power off`() =
    runBlocking(Dispatchers.Unconfined) {
      every { ProtocolStream.create(any(), any(), any()) } returns stream
      coEvery { stream.sendCommand("ip:test", any<ByteArray>()) } returns Unit
      val commandBytes = "0204c0c02a3e14".hexToByteArray()
      val protocol = SonyProtocol()

      protocol.powerOff("ip:test").await()

      // Packet type: Command == 0x02
      // Packet contents length: 4
      // Command packet:
      //   Destination: All monitors == 0xc0 OR Address == 0; => 0xc0
      //   Source: All monitors == 0xc0 OR Address == 0; => 0xc0
      //   Command: PowerOff == 0x2a3e (in BE)
      // Checksum: 0x14
      coVerify { stream.sendCommand("ip:test", commandBytes) }
    }

  @Test
  fun `activate tie`() =
    runBlocking(Dispatchers.Unconfined) {
      every { ProtocolStream.create(any(), any(), any()) } returns stream
      coEvery { stream.sendCommand("ip:test", any<ByteArray>()) } returns Unit
      val commandBytes = "0206c0c02100010157".hexToByteArray()
      val protocol = SonyProtocol()

      protocol.activate("ip:test", 1).await()

      // Packet type: Command == 0x02
      // Packet contents length: 6
      // Command packet:
      //   Destination: All monitors == 0xc0 OR Address == 0; => 0xc0
      //   Source: All monitors == 0xc0 OR Address == 0; => 0xc0
      //   Command: Set Channel == 0x2100 (in BE)
      //   Channel: 1
      //   Unknown: Always 0x01
      // Checksum: 0x57
      coVerify { stream.sendCommand("ip:test", commandBytes) }
    }

  @Test
  fun `activate tie - input range`(): Unit =
    runBlocking(Dispatchers.Unconfined) {
      assertFailsWith<IllegalArgumentException> {
        val protocol = SonyProtocol()
        protocol.sendActivate("ip:test", 0, 0, 0)
      }
      assertFailsWith<IllegalArgumentException> {
        val protocol = SonyProtocol()
        protocol.sendActivate("ip:test", 256, 0, 0)
      }
    }
}
