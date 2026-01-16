package org.sleepingcats.bridgecmdr.server.plugin

import io.konform.validation.Validation
import io.konform.validation.ValidationBuilder
import io.ktor.server.plugins.requestvalidation.RequestValidationConfig
import io.ktor.server.plugins.requestvalidation.ValidationResult

inline fun <reified T : Any> RequestValidationConfig.rules(noinline init: ValidationBuilder<T>.() -> Unit) {
  val validator = Validation(init)
  this.validate<T> { of ->
    val result = validator(of)
    if (result.isValid) {
      ValidationResult.Valid
    } else {
      ValidationResult.Invalid(result.errors.map { it.message })
    }
  }
}
