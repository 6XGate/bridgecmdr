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
import org.sleepingcats.bridgecmdr.common.protocol.ExtronSisProtocol
import org.sleepingcats.bridgecmdr.common.protocol.stream.ProtocolStream
import kotlin.test.Test

class ExtronSisProtocolTest {
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

      val input = 1
      val video = 2
      val audio = 3

      val command = "$input*$video%\r\n$input*$audio$\r\n"
      val protocol = ExtronSisProtocol()

      protocol.activate("ip:test", input, video, audio).await()

      coVerify { stream.sendCommand("ip:test", command) }
    }
}
