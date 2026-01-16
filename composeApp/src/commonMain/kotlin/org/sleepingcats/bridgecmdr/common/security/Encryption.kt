package org.sleepingcats.bridgecmdr.common.security

import java.security.Key
import java.security.PublicKey
import javax.crypto.Cipher

fun getCipher(): Cipher = Cipher.getInstance("RSA/ECB/OAEPWithSHA1AndMGF1Padding")

fun getDecryptor(key: PublicKey): Cipher = getCipher().apply { init(Cipher.DECRYPT_MODE, key) }

fun getDecryptor(key: Key): Cipher = getCipher().apply { init(Cipher.DECRYPT_MODE, key) }

fun getEncryptor(key: PublicKey): Cipher = getCipher().apply { init(Cipher.ENCRYPT_MODE, key) }

fun getEncryptor(key: Key): Cipher = getCipher().apply { init(Cipher.ENCRYPT_MODE, key) }

fun ByteArray.encryptWith(key: PublicKey): ByteArray = getEncryptor(key).doFinal(this)

fun ByteArray.encryptWith(key: Key): ByteArray = getEncryptor(key).doFinal(this)

fun ByteArray.decryptWith(key: PublicKey): ByteArray = getDecryptor(key).doFinal(this)

fun ByteArray.decryptWith(key: Key): ByteArray = getDecryptor(key).doFinal(this)

fun String.encryptWith(key: PublicKey): ByteArray = this.toByteArray().encryptWith(key)

fun String.encryptWith(key: Key): ByteArray = this.toByteArray().encryptWith(key)

fun String.Companion.decrypt(
  data: ByteArray,
  key: PublicKey,
): String = String(data.decryptWith(key))

fun String.Companion.decrypt(
  data: ByteArray,
  key: Key,
): String = String(data.decryptWith(key))
