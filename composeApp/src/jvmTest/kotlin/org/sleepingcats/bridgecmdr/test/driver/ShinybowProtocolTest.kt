package org.sleepingcats.bridgecmdr.test.driver

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
import org.sleepingcats.bridgecmdr.common.protocol.ShinybowProtocol
import org.sleepingcats.bridgecmdr.common.protocol.stream.ProtocolStream
import kotlin.test.Test
import kotlin.test.assertFailsWith

class ShinybowProtocolTest {
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
  fun `protocol version`(): Unit =
    runBlocking(Dispatchers.Unconfined) {
      assertFailsWith<IllegalArgumentException> {
        val protocol = ShinybowProtocol(1)
        protocol.sendPowerOn("ip:test")
      }
      assertFailsWith<IllegalArgumentException> {
        val protocol = ShinybowProtocol(1)
        protocol.sendActivate("ip:test", 1, 1, 1)
      }
    }

  @Test
  fun `power on - v2`() =
    runBlocking(Dispatchers.Unconfined) {
      every { ProtocolStream.create(any(), any(), any()) } returns stream
      coEvery { stream.sendCommand("ip:test", any<String>()) } returns Unit

      val command = "POWER 01;\r\n"
      val protocol = ShinybowProtocol(2)

      protocol.powerOn("ip:test").await()

      coVerify { stream.sendCommand("ip:test", command) }
    }

  @Test
  fun `power on - v3`() =
    runBlocking(Dispatchers.Unconfined) {
      every { ProtocolStream.create(any(), any(), any()) } returns stream
      coEvery { stream.sendCommand("ip:test", any<String>()) } returns Unit

      val command = "POWER 001;\r\n"
      val protocol = ShinybowProtocol(3)

      protocol.powerOn("ip:test").await()

      coVerify { stream.sendCommand("ip:test", command) }
    }

  @Test
  fun `power off - v2`() =
    runBlocking(Dispatchers.Unconfined) {
      every { ProtocolStream.create(any(), any(), any()) } returns stream
      coEvery { stream.sendCommand("ip:test", any<String>()) } returns Unit

      val command = "POWER 00;\r\n"
      val protocol = ShinybowProtocol(2)

      protocol.powerOff("ip:test").await()

      coVerify { stream.sendCommand("ip:test", command) }
    }

  @Test
  fun `power off - v3`() =
    runBlocking(Dispatchers.Unconfined) {
      every { ProtocolStream.create(any(), any(), any()) } returns stream
      coEvery { stream.sendCommand("ip:test", any<String>()) } returns Unit

      val command = "POWER 000;\r\n"
      val protocol = ShinybowProtocol(3)

      protocol.powerOff("ip:test").await()

      coVerify { stream.sendCommand("ip:test", command) }
    }

  @Test
  fun `activate tie - v2`() =
    runBlocking(Dispatchers.Unconfined) {
      every { ProtocolStream.create(any(), any(), any()) } returns stream
      coEvery { stream.sendCommand("ip:test", any<String>()) } returns Unit

      val input = 1
      val output = 20
      val command = "OUTPUT20 01;\r\n"

      val protocol = ShinybowProtocol(2)

      protocol.activate("ip:test", input, output).await()

      coVerify { stream.sendCommand("ip:test", command) }
    }

  @Test
  fun `activate tie - v3`() =
    runBlocking(Dispatchers.Unconfined) {
      every { ProtocolStream.create(any(), any(), any()) } returns stream
      coEvery { stream.sendCommand("ip:test", any<String>()) } returns Unit

      val input = 1
      val output = 202
      val command = "OUTPUT202 001;\r\n"

      val protocol = ShinybowProtocol(3)

      protocol.activate("ip:test", input, output).await()

      coVerify { stream.sendCommand("ip:test", command) }
    }

  @Test
  fun `activate tie - v2 - input range`(): Unit =
    runBlocking(Dispatchers.Unconfined) {
      every { ProtocolStream.create(any(), any(), any()) } returns stream
      coEvery { stream.sendCommand("ip:test", any<String>()) } returns Unit

      val protocol = ShinybowProtocol(2)

      assertFailsWith<IllegalArgumentException> {
        protocol.sendActivate("ip:test", 0, 1, 1)
      }
      assertFailsWith<IllegalArgumentException> {
        protocol.sendActivate("ip:test", 100, 1, 1)
      }
      assertFailsWith<IllegalArgumentException> {
        protocol.sendActivate("ip:test", 1, 0, 1)
      }
      assertFailsWith<IllegalArgumentException> {
        protocol.sendActivate("ip:test", 1, 100, 1)
      }
    }

  @Test
  fun `activate tie - v3 - input range`(): Unit =
    runBlocking(Dispatchers.Unconfined) {
      every { ProtocolStream.create(any(), any(), any()) } returns stream
      coEvery { stream.sendCommand("ip:test", any<String>()) } returns Unit

      val protocol = ShinybowProtocol(3)
      assertFailsWith<IllegalArgumentException> {
        protocol.sendActivate("ip:test", 0, 1, 1)
      }
      assertFailsWith<IllegalArgumentException> {
        protocol.sendActivate("ip:test", 1000, 1, 1)
      }
      assertFailsWith<IllegalArgumentException> {
        protocol.sendActivate("ip:test", 1, 0, 1)
      }
      assertFailsWith<IllegalArgumentException> {
        protocol.sendActivate("ip:test", 1, 1000, 1)
      }
    }
}
