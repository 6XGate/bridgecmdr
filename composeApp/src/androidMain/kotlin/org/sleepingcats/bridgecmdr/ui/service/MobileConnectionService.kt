package org.sleepingcats.bridgecmdr.ui.service

import android.annotation.SuppressLint
import io.github.oshai.kotlinlogging.KLogger
import io.ktor.client.HttpClient
import io.ktor.client.engine.cio.CIO
import io.ktor.client.network.sockets.SocketTimeoutException
import io.ktor.client.plugins.HttpRequestTimeoutException
import io.ktor.client.plugins.HttpSend
import io.ktor.client.plugins.HttpTimeout
import io.ktor.client.plugins.UserAgent
import io.ktor.client.plugins.auth.Auth
import io.ktor.client.plugins.auth.providers.BearerTokens
import io.ktor.client.plugins.auth.providers.bearer
import io.ktor.client.plugins.contentnegotiation.ContentNegotiation
import io.ktor.client.plugins.defaultRequest
import io.ktor.client.plugins.plugin
import io.ktor.http.HttpStatusCode
import io.ktor.http.Url
import io.ktor.serialization.kotlinx.json.json
import io.ktor.util.encodeBase64
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.filterNotNull
import kotlinx.coroutines.flow.last
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.take
import kotlinx.coroutines.flow.update
import org.sleepingcats.bridgecmdr.Branding
import org.sleepingcats.bridgecmdr.common.ServerCode
import org.sleepingcats.bridgecmdr.common.security.TokenService
import org.sleepingcats.bridgecmdr.common.security.encryptWith
import org.sleepingcats.bridgecmdr.common.service.core.ConnectionService
import java.net.ConnectException
import java.security.PublicKey
import java.security.cert.CertificateException
import java.security.cert.X509Certificate
import javax.net.ssl.SSLProtocolException
import javax.net.ssl.X509TrustManager
import kotlin.time.Duration.Companion.seconds

@SuppressLint("CustomX509TrustManager") // Using public key validation.
class MobileConnectionService(
  private val tokenService: TokenService,
  private val logger: KLogger,
) : ConnectionService,
  X509TrustManager {
  private val client = MutableStateFlow<HttpClient?>(null)

  suspend fun getClient(): HttpClient = client.filterNotNull().take(1).last()

  private var troubleLevel = 0

  val connected = client.map { it != null }

  private var publicKey: PublicKey? = null

  /** HTTP status codes that indicate trouble */
  private val troublingCodes =
    listOf(
      // Device time may be too far askew or the server restarted,
      // generating new tokens.
      HttpStatusCode.Unauthorized,
      HttpStatusCode.Forbidden,
      // Server may be overloaded or having issues.
      HttpStatusCode.InternalServerError,
      HttpStatusCode.RequestTimeout,
      HttpStatusCode.BadGateway,
      HttpStatusCode.ServiceUnavailable,
      HttpStatusCode.GatewayTimeout,
    )

  private fun updateConnect(newClient: HttpClient?) {
    client.update { oldClient ->
      if (oldClient != null) {
        logger.info { "Re-initializing connection service, closing existing client" }
        oldClient.close()
      }

      newClient
    }
  }

  private fun resetTroubleLevel() {
    troubleLevel = 0
  }

  private fun raiseTroubleLevel(by: Int = 1) {
    troubleLevel += by
    if (troubleLevel >= 5) {
      logger.warn { "Connection seems troublesome, indicate disconnection" }
      updateConnect(null)
    }
  }

  /** Watches an HTTP request, raising the trouble level if a timeout occurs. */
  override suspend fun <R> watchRequest(block: suspend HttpClient.() -> R): R {
    val theClient = getClient()

    return runCatching { theClient.block() }
      .onSuccess { resetTroubleLevel() }
      .onFailure { cause ->
        when (cause) {
          // These exceptions are serious enough to raise the trouble
          // level significantly, triggering a disconnection.
          is CertificateException,
          is SSLProtocolException,
          is SocketTimeoutException,
          is ConnectException,
          -> raiseTroubleLevel(5)

          // These exception could occur but resolve later, not being
          // serious enough to immediately disconnect.
          is HttpRequestTimeoutException,
          -> raiseTroubleLevel()

          // All other exceptions should be ignored by this process.
          else -> Unit
        }
      }.getOrThrow()
  }

  /** Initializes the connection from a server code. */
  fun initialize(code: ServerCode) {
    logger.info { "Connecting to ${code.url} based on server code" }

    val newClient =
      HttpClient(CIO) {
        engine {
          https {
            serverName = Url(code.url).host
            trustManager = this@MobileConnectionService
          }
        }

        defaultRequest { url(code.url) }
        followRedirects = false
        expectSuccess = true

        install(UserAgent) { agent = "${Branding.name}/${Branding.version}" }
        install(ContentNegotiation) { json() }
        install(HttpTimeout) { requestTimeoutMillis = 5.seconds.inWholeMilliseconds }
        install(Auth) {
          // Uses TOTP based bearer tokens, encrypted with the server's public key.

          bearer {
            realm = Branding.name
            loadTokens {
              val accessToken =
                tokenService
                  .generateToken(code.tokenSecret)
                  .first()
                  .value
                  .encryptWith(code.publicKey)
                  .encodeBase64()

              BearerTokens(accessToken, null)
            }
            refreshTokens {
              val accessToken =
                tokenService
                  .generateToken(code.tokenSecret)
                  .first()
                  .value
                  .encryptWith(code.publicKey)
                  .encodeBase64()

              BearerTokens(accessToken, null)
            }
          }
        }
      }.apply {
        plugin(HttpSend).intercept { request ->
          // If the response has a troubling status code, raise the trouble level.
          val original = execute(request)
          if (original.response.status in troublingCodes) {
            raiseTroubleLevel()
          } else {
            resetTroubleLevel()
          }

          original
        }
      }

    publicKey = code.publicKey
    updateConnect(newClient)
  }

  private fun isCertificateTrusted(cert: X509Certificate): Boolean = runCatching { cert.verify(publicKey) }.isSuccess

  private fun checkChainIsTrusted(
    chain: Array<out X509Certificate?>?,
    lazyMessage: () -> String = { "Certificate chain is not trusted" },
  ) {
    require(chain != null) { "Certificate chain is null" }
    require(chain.isNotEmpty()) { "Certificate chain is empty" }
    for (cert in chain) {
      if (cert == null) continue
      if (isCertificateTrusted(cert)) return
    }

    throw CertificateException(lazyMessage())
  }

  override fun checkClientTrusted(
    chain: Array<out X509Certificate?>?,
    authType: String?,
  ) {
    checkChainIsTrusted(chain)
  }

  override fun checkServerTrusted(
    chain: Array<out X509Certificate?>?,
    authType: String?,
  ) {
    checkChainIsTrusted(chain)
  }

  override fun getAcceptedIssuers(): Array<out X509Certificate?> = emptyArray()
}
