package org.sleepingcats.bridgecmdr.common.service.entity

import org.jetbrains.exposed.v1.core.dao.id.EntityID
import org.jetbrains.exposed.v1.dao.UUIDEntity
import org.jetbrains.exposed.v1.dao.UUIDEntityClass
import org.sleepingcats.bridgecmdr.common.service.table.DevicesTable
import java.util.UUID

class DeviceEntity(
  id: EntityID<UUID>,
) : UUIDEntity(id) {
  companion object : UUIDEntityClass<DeviceEntity>(DevicesTable)

  var driverId: UUID by DevicesTable.driverId
  var title: String by DevicesTable.title
  var path: String by DevicesTable.path
}
