package org.sleepingcats.bridgecmdr.common.service.core

import io.ktor.client.HttpClient

interface ConnectionService {
  suspend fun <R> watchRequest(block: suspend HttpClient.() -> R): R
}
