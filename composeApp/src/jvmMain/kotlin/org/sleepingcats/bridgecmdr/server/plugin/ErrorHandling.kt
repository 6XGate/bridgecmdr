package org.sleepingcats.bridgecmdr.server.plugin

import io.ktor.http.HttpStatusCode
import io.ktor.server.application.Application
import io.ktor.server.application.ApplicationCall
import io.ktor.server.application.install
import io.ktor.server.plugins.BadRequestException
import io.ktor.server.plugins.NotFoundException
import io.ktor.server.plugins.requestvalidation.RequestValidationException
import io.ktor.server.plugins.statuspages.StatusPages
import io.ktor.server.plugins.statuspages.StatusPagesConfig
import io.ktor.server.response.respond
import kotlinx.serialization.Serializable
import kotlin.reflect.KClass

class HttpErrorException(
  val status: HttpStatusCode,
  message: String? = null,
  details: List<String>? = null,
) : Exception(status.description) {
  @Serializable
  data class Payload(
    val status: Int,
    val message: String,
    val description: String? = null,
    val details: List<String>? = null,
  )

  constructor(cause: Throwable) : this(HttpStatusCode.InternalServerError, cause.message)

  constructor(status: HttpStatusCode, cause: Throwable) : this(status, cause.message)

  constructor(cause: RequestValidationException) : this(
    HttpStatusCode.BadRequest,
    "Validation failed for ${cause.value}",
    cause.reasons,
  )

  val payload =
    Payload(
      status.value,
      status.description,
      message,
      details,
    )

  val description by payload::description
  val details by payload::details
}

suspend inline fun ApplicationCall.error(httpError: HttpErrorException) {
  this.respond(httpError.status, httpError.payload)
}

inline fun <reified T : Throwable> StatusPagesConfig.catchAndRespond(status: HttpStatusCode): Unit =
  catchAndRespond(T::class, status)

inline fun <reified T : Throwable> StatusPagesConfig.catchAndRespond(
  klass: KClass<T>,
  status: HttpStatusCode,
): Unit = exception(klass) { call, cause -> call.error(HttpErrorException(status, cause)) }

fun Application.installErrorHandling() {
  install(StatusPages) {
    // Special cases for errors that have specific overloads.
    exception<RequestValidationException> { call, cause -> call.error(HttpErrorException(cause)) }

    catchAndRespond<BadRequestException>(HttpStatusCode.BadRequest)
    catchAndRespond<NotFoundException>(HttpStatusCode.NotFound)
    catchAndRespond<NoSuchElementException>(HttpStatusCode.NotFound)
  }
}
