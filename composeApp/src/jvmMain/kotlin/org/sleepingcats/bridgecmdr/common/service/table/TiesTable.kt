package org.sleepingcats.bridgecmdr.common.service.table

import org.jetbrains.exposed.v1.core.dao.id.UUIDTable

object TiesTable : UUIDTable("ties") {
  val sourceId = uuid("source_id").references(SourcesTable.id)
  val deviceId = uuid("device_id").references(DevicesTable.id)
  val inputChannel = integer("input_channel")
  val outputVideoChannel = integer("output_video_channel").nullable()
  val outputAudioChannel = integer("output_audio_channel").nullable()
}
