package org.sleepingcats.core

import kotlin.io.path.Path

class SystemDirectories(
  branding: ApplicationBranding,
) {
  val config by lazy { BaseDirectories.system.configFor(*branding.qualifiedPath.map { Path(it) }.toTypedArray()) }
  val data by lazy { BaseDirectories.system.dataFor(*branding.qualifiedPath.map { Path(it) }.toTypedArray()) }
}

class UserDirectories(
  branding: ApplicationBranding,
) {
  val config by lazy { BaseDirectories.user.configFor(*branding.qualifiedPath.map { Path(it) }.toTypedArray()) }
  val data by lazy { BaseDirectories.user.dataFor(*branding.qualifiedPath.map { Path(it) }.toTypedArray()) }
  val state by lazy { BaseDirectories.user.stateFor(*branding.qualifiedPath.map { Path(it) }.toTypedArray()) }
  val cache by lazy { BaseDirectories.user.cacheFor(*branding.qualifiedPath.map { Path(it) }.toTypedArray()) }
  val runtime by lazy { BaseDirectories.user.runtime }
}

class ApplicationDirectories(
  branding: ApplicationBranding,
) {
  val system by lazy { SystemDirectories(branding) }
  val user by lazy { UserDirectories(branding) }
}

open class ApplicationEnvironment(
  branding: ApplicationBranding,
) {
  val directories by lazy { ApplicationDirectories(branding) }
}
