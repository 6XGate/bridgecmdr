package org.sleepingcats.bridgecmdr.common.core

import kotlinx.coroutines.Deferred
import org.koin.core.component.get

interface DriverProtocol {
  suspend fun powerOn(uri: String): Deferred<Unit>

  suspend fun powerOff(uri: String): Deferred<Unit>

  suspend fun activate(
    uri: String,
    input: Int,
    videoOutput: Int = input,
    audioOutput: Int = videoOutput,
  ): Deferred<Unit>
}
