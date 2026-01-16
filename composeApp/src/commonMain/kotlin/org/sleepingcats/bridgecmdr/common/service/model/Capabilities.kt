package org.sleepingcats.bridgecmdr.common.service.model

object Capabilities {
  /** No special capabilities */
  const val NONE = 0

  /** Supports multiple video outputs */
  const val MULTIPLE_OUTPUTS = 1 shl 0

  /** Audio can be routed independently of video */
  const val AUDIO_INDEPENDENT = 1 shl 1
}
