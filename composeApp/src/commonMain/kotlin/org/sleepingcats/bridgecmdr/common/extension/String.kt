@file:OptIn(ExperimentalUuidApi::class)

package org.sleepingcats.bridgecmdr.common.extension

import kotlin.uuid.ExperimentalUuidApi
import kotlin.uuid.Uuid

fun String.toUuid(): Uuid = Uuid.parse(this)

fun String.hexToUuid(): Uuid = Uuid.parseHex(this)

fun String.hexDashToUuid(): Uuid = Uuid.parseHexDash(this)
