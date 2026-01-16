package org.sleepingcats.bridgecmdr.common.service.entity

import org.jetbrains.exposed.v1.core.dao.id.EntityID
import org.jetbrains.exposed.v1.dao.UUIDEntity
import org.jetbrains.exposed.v1.dao.UUIDEntityClass
import org.sleepingcats.bridgecmdr.common.service.table.SourcesTable
import java.util.UUID

class SourceEntity(
  id: EntityID<UUID>,
) : UUIDEntity(id) {
  companion object : UUIDEntityClass<SourceEntity>(SourcesTable)

  var title by SourcesTable.title
  var image by SourcesTable.image
}
