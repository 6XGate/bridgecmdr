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
import org.sleepingcats.bridgecmdr.common.protocol.TeslaElecKvmProtocol
import org.sleepingcats.bridgecmdr.common.protocol.stream.ProtocolStream
import kotlin.test.Test
import kotlin.test.assertFailsWith

class TeslaElecKvmProtocolTest {
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
      coEvery { stream.sendCommand("ip:test", any<ByteArray>()) } returns Unit
      val commandBytes = "aabb030101ee".hexToByteArray()
      val protocol = TeslaElecKvmProtocol()

      protocol.activate("ip:test", 1).await()

      coVerify { stream.sendCommand("ip:test", commandBytes) }
    }

  @Test
  fun `activate tie - input range`(): Unit =
    runBlocking(Dispatchers.Unconfined) {
      assertFailsWith<IllegalArgumentException> {
        val protocol = TeslaElecKvmProtocol()
        protocol.sendActivate("ip:test", 0, 0, 0)
      }
      assertFailsWith<IllegalArgumentException> {
        val protocol = TeslaElecKvmProtocol()
        protocol.sendActivate("ip:test", 256, 0, 0)
      }
    }
}
