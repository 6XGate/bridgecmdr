package org.sleepingcats.bridgecmdr.common.service.local

import com.fazecast.jSerialComm.SerialPort
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.koin.core.component.KoinComponent
import org.sleepingcats.bridgecmdr.common.service.SerialPortService
import org.sleepingcats.bridgecmdr.common.service.model.PortInfo

class LocalSerialPortService :
  KoinComponent,
  SerialPortService {
  override suspend fun all(): List<PortInfo> =
    withContext(Dispatchers.IO) {
      SerialPort
        .getCommPorts()
        .filter { port -> port.vendorID != -1 && port.productID != -1 }
        .map { port ->
          PortInfo(
            path = port.systemPortPath,
            serialNumber = port.serialNumber ?: "Unknown",
            manufacturer = port.manufacturer ?: "Unknown",
            title = port.descriptivePortName,
            name = port.systemPortName,
            description = port.portDescription,
            location = port.portLocation,
            productId = port.productID.toShort().toHexString(),
            vendorId = port.vendorID.toShort().toHexString(),
          )
        }
    }
}
