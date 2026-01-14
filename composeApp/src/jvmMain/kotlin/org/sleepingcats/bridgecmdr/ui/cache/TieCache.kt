@file:OptIn(ExperimentalUuidApi::class)

package org.sleepingcats.bridgecmdr.ui.cache

import org.sleepingcats.bridgecmdr.common.service.model.Tie
import org.sleepingcats.bridgecmdr.ui.cache.core.DataCache
import kotlin.uuid.ExperimentalUuidApi
import kotlin.uuid.Uuid

class TieCache : DataCache<Tie, Uuid>() {
  override val key = Tie::id
}
