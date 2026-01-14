package org.sleepingcats.bridgecmdr.common.protocol.stream

import com.fazecast.jSerialComm.SerialPort
import com.fazecast.jSerialComm.SerialPortDataListener
import com.fazecast.jSerialComm.SerialPortEvent
import kotlinx.io.IOException

class SerialCommandStream(
  private val port: SerialPort,
) : AbstractCommandStream() {
  init {
    port.openPort() || throw IOException("Failed to open ${port.systemPortPath}")
    port.addDataListener(
      object : SerialPortDataListener {
        override fun getListeningEvents(): Int = SerialPort.LISTENING_EVENT_DATA_AVAILABLE

        override fun serialEvent(event: SerialPortEvent?) {
          if (event?.eventType != SerialPort.LISTENING_EVENT_DATA_AVAILABLE) return

          val availableBytes = port.bytesAvailable()
          if (availableBytes == 0) return

          val buffer = ByteArray(availableBytes)
          val numRead = port.readBytes(buffer, buffer.size)
          if (numRead == 0) return

          emitData(buffer)
        }
      },
    )
  }

  override suspend fun write(data: ByteArray): Int = port.writeBytes(data, data.size)

  override fun close() {
    port.closePort() || throw Exception("Failed to close port at path: ${port.systemPortPath}")
  }
}
