package org.sleepingcats.bridgecmdr.common.service.table

import org.jetbrains.exposed.v1.core.dao.id.UUIDTable
import org.jetbrains.exposed.v1.core.plus

object SourcesTable : UUIDTable("sources") {
  val title = varchar("title", 255)
  val image = uuid("image").references(UserImagesTable.id).nullable()
}
