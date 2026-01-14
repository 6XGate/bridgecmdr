package org.sleepingcats.bridgecmdr.common.service.table

import org.jetbrains.exposed.v1.core.dao.id.UUIDTable

object DevicesTable : UUIDTable("devices") {
  val driverId = uuid("driver_id")
  val title = varchar("title", 255)
  val path = varchar("path", 255)
}
