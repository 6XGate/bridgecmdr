package org.sleepingcats.bridgecmdr.common.extension

import org.jetbrains.exposed.v1.core.Op
import org.jetbrains.exposed.v1.core.dao.id.IdTable
import org.jetbrains.exposed.v1.core.statements.UpdateBuilder
import org.jetbrains.exposed.v1.jdbc.insertIgnoreAndGetId
import org.jetbrains.exposed.v1.jdbc.select

fun <Key : Any, T : IdTable<Key>> T.insertOrGetId(
  predicate: T.() -> Op<Boolean>,
  body: T.(UpdateBuilder<*>) -> Unit,
) = insertIgnoreAndGetId(body) ?: select(id)
  .where { predicate() }
  .firstOrNull()
  ?.get(id)
