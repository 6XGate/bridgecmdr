package org.sleepingcats.bridgecmdr.common

import com.atlassian.onetime.model.TOTPSecret
import java.security.KeyFactory
import java.security.PublicKey
import java.security.spec.X509EncodedKeySpec
import kotlin.io.encoding.Base64

class ServerCode(
  val url: String,
  val tokenSecret: TOTPSecret,
  val publicKey: PublicKey,
) {
  companion object {
    fun fromQrData(data: String): ServerCode {
      val parts = data.split("|", limit = 3)
      check(parts.size == 3) { "Invalid server code" }

      val (url, encodedTokenSecret, encodedPublicKey) = parts
      val tokenSecret = TOTPSecret.fromBase32EncodedString(encodedTokenSecret)
      val publicKey =
        Base64.decode(encodedPublicKey).run {
          val keyFactory = KeyFactory.getInstance("RSA")
          val keySpec = X509EncodedKeySpec(this)
          keyFactory.generatePublic(keySpec)
        }

      return ServerCode(url, tokenSecret, publicKey)
    }
  }

  val qrCodeData by lazy { "$url|${tokenSecret.base32Encoded}|${Base64.encode(publicKey.encoded)}" }
}
