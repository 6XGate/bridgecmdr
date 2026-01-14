package org.sleepingcats.bridgecmdr.common.service.table

import org.jetbrains.exposed.v1.core.dao.id.IdTable

object SettingsTable : IdTable<String>("settings") {
  override val id = varchar("name", 255).entityId()
  override val primaryKey = PrimaryKey(id)
  val value = text("value")
}
