package org.sleepingcats.bridgecmdr.common.protocol.stream

import com.fazecast.jSerialComm.SerialPort.EVEN_PARITY
import com.fazecast.jSerialComm.SerialPort.MARK_PARITY
import com.fazecast.jSerialComm.SerialPort.NO_PARITY
import com.fazecast.jSerialComm.SerialPort.ODD_PARITY
import com.fazecast.jSerialComm.SerialPort.SPACE_PARITY

enum class Parity(
  val value: Int,
) {
  None(NO_PARITY),
  Even(EVEN_PARITY),
  Odd(ODD_PARITY),
  Mark(MARK_PARITY),
  Space(SPACE_PARITY),
}
