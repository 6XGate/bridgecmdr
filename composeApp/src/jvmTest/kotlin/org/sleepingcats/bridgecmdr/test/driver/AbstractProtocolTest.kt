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
import org.junit.jupiter.api.assertDoesNotThrow
import org.koin.dsl.module
import org.koin.test.KoinTestRule
import org.sleepingcats.bridgecmdr.common.protocol.ExtronSisProtocol
import org.sleepingcats.bridgecmdr.common.protocol.SonyProtocol
import org.sleepingcats.bridgecmdr.common.protocol.stream.ProtocolStream
import kotlin.test.Test

class AbstractProtocolTest {
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
  fun `no-op power on`() =
    runBlocking(Dispatchers.Unconfined) {
      every { ProtocolStream.create(any(), any(), any()) } returns stream
      coEvery { stream.sendCommand(any(), any<String>()) } throws Exception("Simulated send failure")
      coEvery { stream.sendCommand(any(), any<ByteArray>()) } throws Exception("Simulated send failure")
      val protocol = ExtronSisProtocol()

      assertDoesNotThrow {
        protocol.sendPowerOn("ip:test")
      }

      coVerify(exactly = 0) { stream.sendCommand(any(), any<String>()) }
      coVerify(exactly = 0) { stream.sendCommand(any(), any<ByteArray>()) }
    }

  @Test
  fun `no-op power off`() =
    runBlocking(Dispatchers.Unconfined) {
      every { ProtocolStream.create(any(), any(), any()) } returns stream
      coEvery { stream.sendCommand(any(), any<String>()) } throws Exception("Simulated send failure")
      coEvery { stream.sendCommand(any(), any<ByteArray>()) } throws Exception("Simulated send failure")
      val protocol = ExtronSisProtocol()

      assertDoesNotThrow {
        protocol.sendPowerOff("ip:test")
      }

      coVerify(exactly = 0) { stream.sendCommand(any(), any<String>()) }
      coVerify(exactly = 0) { stream.sendCommand(any(), any<ByteArray>()) }
    }

  @Test
  fun `power on`() =
    runBlocking(Dispatchers.Unconfined) {
      every { ProtocolStream.create(any(), any(), any()) } returns stream
      coEvery { stream.sendCommand(any(), any<ByteArray>()) } throws Exception("Simulated send failure")
      val protocol = SonyProtocol()

      assertDoesNotThrow {
        protocol.powerOn("ip:test").await()
      }
    }

  @Test
  fun `power off`() =
    runBlocking(Dispatchers.Unconfined) {
      every { ProtocolStream.create(any(), any(), any()) } returns stream
      coEvery { stream.sendCommand(any(), any<ByteArray>()) } throws Exception("Simulated send failure")
      val protocol = SonyProtocol()

      assertDoesNotThrow {
        protocol.powerOff("ip:test").await()
      }
    }

  @Test
  fun `activate tie`() =
    runBlocking(Dispatchers.Unconfined) {
      every { ProtocolStream.create(any(), any(), any()) } returns stream
      coEvery { stream.sendCommand(any(), any<ByteArray>()) } throws Exception("Simulated send failure")
      val protocol = SonyProtocol()

      assertDoesNotThrow {
        protocol.activate("ip:test", 1).await()
      }
    }
}
