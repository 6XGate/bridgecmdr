package org.sleepingcats.core

class JvmPlatform : Platform {
  override val name = checkNotNull(System.getProperty("os.name"))
  override val version = checkNotNull(System.getProperty("os.version"))
  override val arch = checkNotNull(System.getProperty("os.arch"))
  override val type = PlatformType.Jvm
}

actual fun getPlatform(): Platform = JvmPlatform()
