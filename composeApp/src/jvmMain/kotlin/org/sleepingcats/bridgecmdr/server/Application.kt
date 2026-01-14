package org.sleepingcats.bridgecmdr.server

import com.atlassian.onetime.core.TOTP
import com.atlassian.onetime.service.TOTPVerificationResult.Success
import io.ktor.serialization.kotlinx.json.json
import io.ktor.server.application.Application
import io.ktor.server.application.install
import io.ktor.server.auth.Authentication
import io.ktor.server.auth.authenticate
import io.ktor.server.auth.bearer
import io.ktor.server.plugins.contentnegotiation.ContentNegotiation
import io.ktor.server.resources.Resources
import io.ktor.server.routing.routing
import org.koin.ktor.ext.inject
import org.sleepingcats.bridgecmdr.Branding
import org.sleepingcats.bridgecmdr.common.security.TokenService
import org.sleepingcats.bridgecmdr.common.security.decrypt
import org.sleepingcats.bridgecmdr.server.plugin.installErrorHandling
import org.sleepingcats.bridgecmdr.server.route.devices
import org.sleepingcats.bridgecmdr.server.route.drivers
import org.sleepingcats.bridgecmdr.server.route.images
import org.sleepingcats.bridgecmdr.server.route.power
import org.sleepingcats.bridgecmdr.server.route.serialPorts
import org.sleepingcats.bridgecmdr.server.route.sources
import org.sleepingcats.bridgecmdr.server.route.ties
import org.sleepingcats.bridgecmdr.server.security.ServerContext
import org.sleepingcats.bridgecmdr.server.security.UserPrincipal
import kotlin.getValue
import kotlin.io.encoding.Base64

fun Application.application(context: ServerContext) {
  val tokenService: TokenService by inject()

  install(ContentNegotiation) { json() }
  install(Resources)
  installErrorHandling()

  install(Authentication) {
    bearer(Branding.qualifiedName) {
      realm = Branding.name
      authenticate { credentials ->
        val totp = TOTP(String.decrypt(Base64.decode(credentials.token), context.privateKey))
        if (tokenService.verifyToken(totp, context.tokenSecret) is Success) UserPrincipal else null
      }
    }
  }

  routing {
    authenticate(Branding.qualifiedName) {
      devices()
      drivers()
      images()
      power()
      serialPorts()
      sources()
      ties()
    }
  }
}
