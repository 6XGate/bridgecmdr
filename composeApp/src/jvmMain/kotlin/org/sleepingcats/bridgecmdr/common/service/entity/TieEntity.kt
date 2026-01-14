package org.sleepingcats.bridgecmdr.common.service.entity

import org.jetbrains.exposed.v1.core.dao.id.EntityID
import org.jetbrains.exposed.v1.dao.UUIDEntity
import org.jetbrains.exposed.v1.dao.UUIDEntityClass
import org.sleepingcats.bridgecmdr.common.service.table.TiesTable
import java.util.UUID

class TieEntity(
  id: EntityID<UUID>,
) : UUIDEntity(id) {
  companion object : UUIDEntityClass<TieEntity>(TiesTable)

  var sourceId by TiesTable.sourceId
  var deviceId by TiesTable.deviceId
  var inputChannel by TiesTable.inputChannel
  var outputVideoChannel by TiesTable.outputVideoChannel
  var outputAudioChannel by TiesTable.outputAudioChannel
}
