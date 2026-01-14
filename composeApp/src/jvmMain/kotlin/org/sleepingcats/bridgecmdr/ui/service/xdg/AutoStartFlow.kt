@file:OptIn(ExperimentalForInheritanceCoroutinesApi::class)

package org.sleepingcats.bridgecmdr.ui.service.xdg

import bridgecmdr.composeapp.generated.resources.Res
import bridgecmdr.composeapp.generated.resources.branding_appName
import io.github.oshai.kotlinlogging.KLogger
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalForInheritanceCoroutinesApi
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import org.jetbrains.compose.resources.getString
import org.sleepingcats.bridgecmdr.Branding
import org.sleepingcats.bridgecmdr.ui.service.xdg.entry.AsciiString
import org.sleepingcats.bridgecmdr.ui.service.xdg.entry.DesktopEntryFile
import org.sleepingcats.bridgecmdr.ui.service.xdg.entry.IconString
import org.sleepingcats.bridgecmdr.ui.service.xdg.entry.ListOfAsciiStrings
import org.sleepingcats.core.BaseDirectories
import kotlin.io.path.createParentDirectories
import kotlin.io.path.div
import kotlin.io.path.exists
import kotlin.io.path.writeLines

class AutoStartFlow private constructor(
  private val logger: KLogger,
  private val flow: MutableStateFlow<Boolean>,
) : Flow<Boolean> by flow {
  companion object {
    operator fun invoke(
      logger: KLogger,
      scope: CoroutineScope,
    ): AutoStartFlow =
      AutoStartFlow(logger, MutableStateFlow(false)).apply {
        scope.launch(Dispatchers.IO) {
          if (!autoStartFile.exists()) return@launch
          runCatching {
            flow.update { true }
            val desktopFile = DesktopEntryFile.read(autoStartFile)

            // Ensure the path is correct.
            val exec = desktopFile.get("Desktop Entry", "Exec", AsciiString)
            // TODO: Exec path must be determined properly.
            if (exec != null && exec == "ExecPathPlaceholder") return@runCatching
            logger.info { "Correcting autostart exec path: $exec" }

            // Fix the path.
            desktopFile.set(
              "Desktop Entry",
              "Exec",
              "ExecPathPlaceholder",
              AsciiString,
            )

            autoStartFile.writeLines(desktopFile)
          }.onFailure { flow.update { false } }
            .onFailure { throwable -> logger.error(throwable) { "Failed to correct auto-start entry" } }
        }
      }
  }

  private val autoStartFile by lazy {
    (BaseDirectories.user.config / "autostart" / "${Branding.applicationId}.desktop").also { path ->
      logger.debug { "Auto-start file path: $path" }
    }
  }

  suspend fun enable() =
    withContext(Dispatchers.IO) {
      val appName = getString(Res.string.branding_appName)
      runCatching {
        autoStartFile.createParentDirectories()
        val desktopFile =
          DesktopEntryFile.create {
            section("Desktop Entry") {
              set("Type", "Application", AsciiString)
              set("Version", "1.0", AsciiString)
              set("Name", appName)
              set("Comment", "Launch $appName at login")
              set("Exec", "ExecPathPlaceholder", AsciiString) // TODO: Set correct exec path
              set("Icon", Branding.applicationId, IconString)
              set("Terminal", false)
              set("Categories", listOf("Utility"), ListOfAsciiStrings)
            }
          }
        autoStartFile.writeLines(desktopFile)
      }.onSuccess { flow.update { true } }
        .onFailure { throwable -> logger.error(throwable) { "Failed to enable auto-start entry" } }
        .getOrElse { }
    }

  suspend fun disable() =
    withContext(Dispatchers.IO) {
      runCatching { if (autoStartFile.exists()) autoStartFile.toFile().delete() }
        .onSuccess { flow.update { false } }
        .onFailure { throwable -> logger.error(throwable) { "Failed to disable auto-start entry" } }
        .getOrElse { }
    }
}
