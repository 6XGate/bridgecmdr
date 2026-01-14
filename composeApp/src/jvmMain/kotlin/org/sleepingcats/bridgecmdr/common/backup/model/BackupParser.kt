package org.sleepingcats.bridgecmdr.common.backup.model

interface BackupParser<LatestVersion> {
  fun parseBackup(raw: String): LatestVersion
}
