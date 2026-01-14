package org.sleepingcats.bridgecmdr.common.protocol.support.sony

open class SonyDriverError(
  message: String = "Unknown error",
  cause: Throwable? = null,
) : Error("[Sony Driver]: $message", cause)
