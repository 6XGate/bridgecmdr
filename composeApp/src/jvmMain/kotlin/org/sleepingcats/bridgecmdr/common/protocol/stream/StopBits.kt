package org.sleepingcats.bridgecmdr.common.protocol.stream

import com.fazecast.jSerialComm.SerialPort.ONE_POINT_FIVE_STOP_BITS
import com.fazecast.jSerialComm.SerialPort.ONE_STOP_BIT
import com.fazecast.jSerialComm.SerialPort.TWO_STOP_BITS

enum class StopBits(
  val value: Int,
) {
  One(ONE_STOP_BIT),
  OnePointFive(ONE_POINT_FIVE_STOP_BITS),
  Two(TWO_STOP_BITS),
}
