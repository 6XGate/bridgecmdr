package org.sleepingcats.bridgecmdr.ui.cache

import org.sleepingcats.bridgecmdr.common.service.model.PortInfo
import org.sleepingcats.bridgecmdr.ui.cache.core.DataCache

class PortCache : DataCache<PortInfo, String>() {
  override val key = PortInfo::path
}
