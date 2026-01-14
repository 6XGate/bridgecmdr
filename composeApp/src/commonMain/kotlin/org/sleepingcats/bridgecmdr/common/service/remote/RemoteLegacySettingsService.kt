package org.sleepingcats.bridgecmdr.common.service.remote

import org.sleepingcats.bridgecmdr.common.service.LegacySettingsService
import org.sleepingcats.bridgecmdr.common.service.model.LegacySettings

class RemoteLegacySettingsService : LegacySettingsService {
  // Not implemented for remote connections.
  override suspend fun read(): LegacySettings? = null
}
