package org.sleepingcats.bridgecmdr.common.service.entity

import org.jetbrains.exposed.v1.core.dao.id.EntityID
import org.jetbrains.exposed.v1.dao.Entity
import org.jetbrains.exposed.v1.dao.EntityClass
import org.sleepingcats.bridgecmdr.common.service.table.SettingsTable

class SettingEntity(
  name: EntityID<String>,
) : Entity<String>(name) {
  companion object : EntityClass<String, SettingEntity>(SettingsTable)

  var value: String by SettingsTable.value
}
