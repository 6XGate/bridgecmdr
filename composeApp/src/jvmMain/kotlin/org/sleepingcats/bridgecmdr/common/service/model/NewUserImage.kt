package org.sleepingcats.bridgecmdr.common.service.model

import kotlinx.serialization.Serializable
import java.security.MessageDigest

@Serializable
class NewUserImage(
  val bytes: ByteArray,
  val type: String,
) {
  val hash: ByteArray = MessageDigest.getInstance("SHA-256").digest(bytes)
}
