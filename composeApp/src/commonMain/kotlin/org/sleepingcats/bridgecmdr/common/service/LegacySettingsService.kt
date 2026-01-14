package org.sleepingcats.bridgecmdr.common.service

import org.sleepingcats.bridgecmdr.common.service.model.LegacySettings

interface LegacySettingsService {
  suspend fun read(): LegacySettings?
}
