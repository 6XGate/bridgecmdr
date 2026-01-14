package org.sleepingcats.bridgecmdr.common.protocol.support.sony

class PacketError(
  message: String = "Unknown packet error",
  cause: Throwable? = null,
) : SonyDriverError(message, cause)
