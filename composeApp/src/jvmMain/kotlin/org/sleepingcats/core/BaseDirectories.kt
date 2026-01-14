package org.sleepingcats.core

import java.nio.file.Path
import java.nio.file.Paths
import kotlin.io.path.div

private val homePath by lazy { checkNotNull(Paths.get(System.getProperty("user.home"))) }

private fun root() = Paths.get("/")

private fun cDrive() = Paths.get("C:\\")

private operator fun Path.div(paths: Array<out Path>) = paths.fold(this) { current, next -> current / next }

private fun findDirectoryList(
  from: String,
  defaults: List<Path>,
) = System.getenv(from)?.split(':')?.map { Paths.get(it) } ?: defaults

private fun findDirectory(
  from: String,
  default: Path,
) = System.getenv(from)?.let { Paths.get(it) } ?: default

private fun expandPath(string: String) =
  checkNotNull(
    Path.of(
      System.getenv().toList().fold(string) { string, (key, value) ->
        string.replace($$"$$${key}", value)
      },
    ),
  )

interface BaseSystemDirectories {
  val config: List<Path>
  val data: List<Path>

  fun configFor(vararg qualifiers: Path): List<Path>

  fun dataFor(vararg qualifiers: Path): List<Path>
}

class XdgSystemDirectories : BaseSystemDirectories {
  override val config by lazy { findDirectoryList("XDG_CONFIG_DIRS", listOf(root() / "etc")) }
  override val data by lazy {
    findDirectoryList(
      "XDG_DATA_DIRS",
      listOf(
        root() / "usr" / "share",
        root() / "usr" / "local" / "share",
      ),
    )
  }

  override fun configFor(vararg qualifiers: Path) = config.map { it / qualifiers }

  override fun dataFor(vararg qualifiers: Path) = data.map { it / qualifiers }
}

class WindowsSystemDirectories : BaseSystemDirectories {
  override val config by lazy { findDirectoryList("ALLUSERSPROFILE", listOf(cDrive() / "ProgramData")) }
  override val data by lazy { findDirectoryList("ALLUSERSPROFILE", listOf(cDrive() / "ProgramData")) }

  override fun configFor(vararg qualifiers: Path) = config.map { it / qualifiers / "Settings" }

  override fun dataFor(vararg qualifiers: Path) = data.map { it / qualifiers / "Data" }
}

class MacOsSystemDirectories : BaseSystemDirectories {
  override val config by lazy { listOf(root() / "Library" / "Preferences") }
  override val data by lazy { listOf(root() / "Library" / "Application Support") }

  override fun configFor(vararg qualifiers: Path) = config.map { it / qualifiers }

  override fun dataFor(vararg qualifiers: Path) = data.map { it / qualifiers }
}

interface BaseUserDirectories {
  val config: Path
  val data: Path
  val state: Path
  val cache: Path

  val runtime: Path

  fun configFor(vararg qualifiers: Path): Path

  fun dataFor(vararg qualifiers: Path): Path

  fun stateFor(vararg qualifiers: Path): Path

  fun cacheFor(vararg qualifiers: Path): Path
}

class XdgUserDirectories : BaseUserDirectories {
  override val config by lazy { findDirectory("XDG_CONFIG_HOME", homePath / ".config") }
  override val data by lazy { findDirectory("XDG_DATA_HOME", homePath / ".local" / "share") }
  override val state by lazy { findDirectory("XDG_STATE_HOME", homePath / ".local" / "state") }
  override val cache by lazy { findDirectory("XDG_CACHE_HOME", homePath / ".cache") }

  override val runtime by lazy { findDirectory("XDG_RUNTIME_DIR", root() / "tmp") }

  override fun configFor(vararg qualifiers: Path) = config / qualifiers

  override fun dataFor(vararg qualifiers: Path) = data / qualifiers

  override fun stateFor(vararg qualifiers: Path) = state / qualifiers

  override fun cacheFor(vararg qualifiers: Path) = cache / qualifiers
}

class WindowsUserDirectories : BaseUserDirectories {
  override val config by lazy { findDirectory("APPDATA", homePath / "AppData" / "Roaming") }
  override val data by lazy { findDirectory("APPDATA", homePath / "AppData" / "Roaming") }
  override val state by lazy { findDirectory("LOCALAPPDATA", homePath / "AppData" / "Local") }
  override val cache by lazy { findDirectory("LOCALAPPDATA", homePath / "AppData" / "Local") }

  override val runtime: Path get() = TODO("Implement Windows runtime directory")

  override fun configFor(vararg qualifiers: Path) = config / qualifiers / "Settings"

  override fun dataFor(vararg qualifiers: Path) = data / qualifiers / "Data"

  override fun stateFor(vararg qualifiers: Path) = state / qualifiers / "State"

  override fun cacheFor(vararg qualifiers: Path) = cache / qualifiers / "Cache"
}

class MacOsUserDirectories : BaseUserDirectories {
  override val config by lazy { homePath / "Library" / "Preferences" }
  override val data by lazy { homePath / "Library" / "Application Support" }
  override val state by lazy { homePath / "Library" / "Application Support" }
  override val cache by lazy { homePath / "Library" / "Caches" }

  override val runtime by lazy { expandPath($$"$TMPDIR") / expandPath($$"runtime-$UID") }

  override fun configFor(vararg qualifiers: Path) = config / qualifiers

  override fun dataFor(vararg qualifiers: Path) = data / qualifiers / "Data"

  override fun stateFor(vararg qualifiers: Path) = data / qualifiers / "State"

  override fun cacheFor(vararg qualifiers: Path) = cache / qualifiers
}

object BaseDirectories {
  val home by lazy { homePath }
  val user: BaseUserDirectories by lazy {
    when {
      Platform.isWindows -> WindowsUserDirectories()
      Platform.isMac -> MacOsUserDirectories()
      else -> XdgUserDirectories()
    }
  }
  val system: BaseSystemDirectories by lazy {
    when {
      Platform.isWindows -> WindowsSystemDirectories()
      Platform.isMac -> MacOsSystemDirectories()
      else -> XdgSystemDirectories()
    }
  }
}
