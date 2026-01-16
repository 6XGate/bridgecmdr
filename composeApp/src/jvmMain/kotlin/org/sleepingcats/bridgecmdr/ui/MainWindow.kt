package org.sleepingcats.bridgecmdr.ui

import androidx.compose.runtime.Composable
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.unit.DpSize
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.Window
import androidx.compose.ui.window.WindowPlacement
import androidx.compose.ui.window.rememberWindowState
import bridgecmdr.composeapp.generated.resources.Res
import bridgecmdr.composeapp.generated.resources.app_icon
import bridgecmdr.composeapp.generated.resources.branding_appName
import kotlinx.coroutines.launch
import org.jetbrains.compose.resources.painterResource
import org.jetbrains.compose.resources.stringResource
import org.sleepingcats.bridgecmdr.common.isDevelopment
import org.sleepingcats.bridgecmdr.ui.service.ApplicationService

@Composable
fun MainWindow(
  applicationService: ApplicationService,
  content: @Composable () -> Unit,
) {
  val icon = painterResource(Res.drawable.app_icon)
  val windowState =
    rememberWindowState().apply {
      if (isDevelopment) {
        // In development mode, use a fixed window size.
        size = DpSize(800.dp, 600.dp)
      } else {
        // In release mode, start full screen.
        placement = WindowPlacement.Fullscreen
      }
    }

  val scope = rememberCoroutineScope()

  Window(
    onCloseRequest = { scope.launch { applicationService.quit() } },
    title = stringResource(Res.string.branding_appName),
    state = windowState,
    icon = icon,
  ) {
    content()
  }
}
