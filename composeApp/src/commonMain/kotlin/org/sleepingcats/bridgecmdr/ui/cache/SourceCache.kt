@file:OptIn(ExperimentalUuidApi::class)

package org.sleepingcats.bridgecmdr.ui.cache

import org.sleepingcats.bridgecmdr.common.service.model.Source
import org.sleepingcats.bridgecmdr.ui.cache.core.DataCache
import kotlin.uuid.ExperimentalUuidApi
import kotlin.uuid.Uuid

class SourceCache : DataCache<Source, Uuid>() {
  override val key = Source::id
}
