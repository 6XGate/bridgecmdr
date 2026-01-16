package org.sleepingcats.core

// TODO: WasmWasi?

enum class PlatformType {
  /** Native platforms: Linux, Windows, macOS, FreeBSD, etc. */
  Native,

  /** Desktop JVM: Linux, Windows, macOS, FreeBSD, etc. */
  Jvm,

  /** JavaScript */
  Web,

  /** WebAssembly */
  Wasm,

  /** iOS, iPadOS, watchOS, visionOs, and macOS Catalyst */
  DarwinMobile,

  /** Android */
  Android,
}

interface Platform {
  val name: String
  val version: String
  val arch: String
  val type: PlatformType

  companion object : Platform {
    val current = getPlatform()

    override val name = current.name
    override val version = current.version
    override val arch = current.arch
    override val type = current.type

    val isWindows = current.name.lowercase().startsWith("windows")

    val isMac = current.name.lowercase().startsWith("mac os x")

    val isPosix = !isWindows || isMac
  }
}

expect fun getPlatform(): Platform
