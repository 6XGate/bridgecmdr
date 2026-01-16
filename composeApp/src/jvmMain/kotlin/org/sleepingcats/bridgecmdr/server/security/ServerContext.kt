package org.sleepingcats.bridgecmdr.server.security

import com.atlassian.onetime.model.TOTPSecret
import io.github.oshai.kotlinlogging.KLogger
import io.ktor.network.tls.certificates.buildKeyStore
import io.ktor.network.tls.certificates.saveToFile
import io.ktor.network.tls.extensions.HashAlgorithm.SHA1
import io.ktor.network.tls.extensions.SignatureAlgorithm.RSA
import org.koin.core.component.KoinComponent
import org.koin.core.component.get
import org.sleepingcats.bridgecmdr.Environment
import org.sleepingcats.bridgecmdr.common.isDevelopment
import org.sleepingcats.bridgecmdr.common.security.TokenService
import org.sleepingcats.bridgecmdr.server.SECURE_SERVER_PORT
import java.net.Inet4Address
import java.net.InetAddress
import java.nio.file.attribute.PosixFilePermission.OWNER_READ
import java.nio.file.attribute.PosixFilePermission.OWNER_WRITE
import java.security.Key
import java.security.KeyStore
import java.security.PublicKey
import java.security.SecureRandom
import javax.security.auth.x500.X500Principal
import kotlin.io.path.div
import kotlin.io.path.setPosixFilePermissions

private val passwordCharSet =
  ('A'..'Z') + ('a'..'z') + ('0'..'9') + listOf('!', '@', '#', '$', '%', '^', '&', '*', '(', ')')

private fun getPasswordGenerator() = generateSequence { passwordCharSet[SecureRandom().nextInt(passwordCharSet.size)] }

private fun generatePassword(length: Int = 64) = String(getPasswordGenerator().take(length).toList().toCharArray())

class ServerContext(
  val bindAddress: String = "0.0.0.0",
  val serverAddress: String,
  val keyStore: KeyStore,
  val keyStorePassword: String,
  val publicKey: PublicKey,
  val privateKey: Key,
  val privateKeyPassword: String,
  val tokenSecret: TOTPSecret,
  val port: Int = SECURE_SERVER_PORT,
) {
  companion object : KoinComponent {
    suspend fun create(
      logger: KLogger = get(),
      tokenService: TokenService = get(),
    ): ServerContext {
      val keyStorePassword = generatePassword()
      val hostAddress =
        runCatching { checkNotNull(InetAddress.getLocalHost()) }
          .onFailure { throwable -> logger.warn(throwable) { "Failed to get local host address" } }
          .onSuccess { if (!it.isSiteLocalAddress) logger.warn { "IP Address is not site: ${it.hostAddress}" } }
          .getOrNull()
      val address = hostAddress?.run { this.hostAddress } ?: "127.0.0.1"
      val hostNames =
        hostAddress
          ?.run { setOf("localhost", this.hostName, this.canonicalHostName).filterNotNull().toTypedArray() }
          ?: arrayOf("localhost")
      val emulatorAddress = if (isDevelopment) arrayOf("10.0.2.2") else emptyArray<String>()
      val hostIpAddresses =
        hostAddress?.run { setOf("127.0.0.1", *emulatorAddress, this.hostAddress).filterNotNull().toTypedArray() }
          ?: arrayOf("127.0.01", *emulatorAddress)
      val privateKeyPassword = generatePassword()
      val keyStoreFile = Environment.directories.user.runtime / "keystore.jks"
      val keyStore =
        buildKeyStore {
          certificate("bridgeCmdr") {
            password = privateKeyPassword
            subject = X500Principal("CN=bridgeCmdr, O=Sleeping Cats, OU=FOSS, C=US")
            ipAddresses = hostIpAddresses.map { Inet4Address.getByName(it) }
            domains = listOf(*hostIpAddresses, *hostNames)
            // Ensure the key uses an algorithm we expect.
            hash = SHA1
            sign = RSA
          }
        }.apply {
          saveToFile(keyStoreFile.toFile(), keyStorePassword)
        }

      keyStoreFile.setPosixFilePermissions(setOf(OWNER_READ, OWNER_WRITE))

      val certificate =
        checkNotNull(keyStore.getCertificate("bridgeCmdr")) { "Certificate should be present in keystore" }
      val publicKey = checkNotNull(certificate.publicKey) { "Public key should be present in certificate" }
      logger.warn { "Public key format: ${publicKey.format}, algo: ${publicKey.algorithm}" }
      val privateKey =
        checkNotNull(keyStore.getKey("bridgeCmdr", privateKeyPassword.toCharArray())) {
          "Private key should be present in keystore"
        }

      val tokenSecret = tokenService.generateSecret()

      return ServerContext(
        keyStore = keyStore,
        keyStorePassword = keyStorePassword,
        publicKey = publicKey,
        privateKey = privateKey,
        privateKeyPassword = privateKeyPassword,
        serverAddress = address,
        tokenSecret = tokenSecret,
      )
    }
  }
}
