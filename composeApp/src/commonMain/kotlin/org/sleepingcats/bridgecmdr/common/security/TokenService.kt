package org.sleepingcats.bridgecmdr.common.security

import com.atlassian.onetime.core.HMACDigest.SHA1
import com.atlassian.onetime.core.OTPLength.TEN
import com.atlassian.onetime.core.TOTP
import com.atlassian.onetime.core.TOTPGenerator
import com.atlassian.onetime.model.TOTPSecret
import com.atlassian.onetime.service.CPSAsciiRangeSecretProvider
import com.atlassian.onetime.service.DefaultTOTPService
import com.atlassian.onetime.service.TOTPConfiguration
import java.time.Clock
import java.util.GregorianCalendar

class TokenService {
  private val startTime by lazy { GregorianCalendar(2019, 0, 1).time.time.toInt() }

  private val secretGenerator by lazy { CPSAsciiRangeSecretProvider() }

  private val generator by lazy { TOTPGenerator(Clock.systemUTC(), startTime, 30, TEN, SHA1) }

  private val configuration by lazy { TOTPConfiguration(1, 1) }

  private val service by lazy { DefaultTOTPService(generator, configuration) }

  suspend fun generateSecret() = secretGenerator.generateSecret()

  fun generateToken(secret: TOTPSecret) = generator.generate(secret)

  fun verifyToken(
    token: TOTP,
    secret: TOTPSecret,
  ) = service.verify(token, secret)
}
