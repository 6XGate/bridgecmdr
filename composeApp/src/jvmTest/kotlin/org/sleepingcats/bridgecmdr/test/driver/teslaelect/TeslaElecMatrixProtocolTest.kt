package org.sleepingcats.bridgecmdr.test.driver.teslaelect

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
import org.sleepingcats.bridgecmdr.common.protocol.TeslaElecMatrixProtocol
import org.sleepingcats.bridgecmdr.common.protocol.stream.ProtocolStream
import kotlin.test.Test
import kotlin.test.assertFailsWith

class TeslaElecMatrixProtocolTest {
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
  fun `activate tie`() =
    runBlocking(Dispatchers.Unconfined) {
      every { ProtocolStream.create(any(), any(), any()) } returns stream
      coEvery { stream.sendCommand("ip:test", any<String>()) } returns Unit
      val commandBytes = "MT00SW0102NT\r\n"
      val protocol = TeslaElecMatrixProtocol()

      protocol.activate("ip:test", 1, 2).await()

      coVerify { stream.sendCommand("ip:test", commandBytes) }
    }

  @Test
  fun `activate tie - input range`(): Unit =
    runBlocking(Dispatchers.Unconfined) {
      assertFailsWith<IllegalArgumentException> {
        val protocol = TeslaElecMatrixProtocol()
        protocol.sendActivate("ip:test", 0, 1, 0)
      }
      assertFailsWith<IllegalArgumentException> {
        val protocol = TeslaElecMatrixProtocol()
        protocol.sendActivate("ip:test", 100, 1, 0)
      }
      assertFailsWith<IllegalArgumentException> {
        val protocol = TeslaElecMatrixProtocol()
        protocol.sendActivate("ip:test", 1, 0, 0)
      }
      assertFailsWith<IllegalArgumentException> {
        val protocol = TeslaElecMatrixProtocol()
        protocol.sendActivate("ip:test", 1, 100, 0)
      }
    }
}
