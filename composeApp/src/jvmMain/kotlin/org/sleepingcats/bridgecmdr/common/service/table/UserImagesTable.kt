package org.sleepingcats.bridgecmdr.common.service.table

import org.jetbrains.exposed.v1.core.dao.id.UUIDTable

object UserImagesTable : UUIDTable("images") {
  val data = blob("data")
  val type = varchar("type", 255)
  val hash = binary("hash", 32).uniqueIndex()
}
