package org.sleepingcats.bridgecmdr

import androidx.compose.foundation.background
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.LocalContentColor
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.rememberNavController
import bridgecmdr.composeapp.generated.resources.Res
import bridgecmdr.composeapp.generated.resources.unknown_error
import org.jetbrains.compose.resources.stringResource
import org.koin.compose.viewmodel.koinViewModel
import org.sleepingcats.bridgecmdr.common.setting.AppTheme
import org.sleepingcats.bridgecmdr.ui.component.AlertModal
import org.sleepingcats.bridgecmdr.ui.getStartupRoute
import org.sleepingcats.bridgecmdr.ui.routes
import org.sleepingcats.bridgecmdr.ui.theme.BridgeCmdrTheme
import org.sleepingcats.bridgecmdr.ui.view.model.ApplicationViewModel

@Composable
fun App(viewModel: ApplicationViewModel = koinViewModel()) {
  val navController = rememberNavController()
  val state by viewModel.state.collectAsState()
  val useDarkTheme =
    when (state.appTheme) {
      AppTheme.System -> isSystemInDarkTheme()
      AppTheme.Light -> false
      AppTheme.Dark -> true
    }

  BridgeCmdrTheme(useDarkTheme) {
    CompositionLocalProvider(LocalContentColor provides MaterialTheme.colorScheme.onSurface) {
      AlertModal(
        visible = state.error != null,
        onClose = { viewModel.dismissError() },
        title = { Text(stringResource(state.error?.resource ?: Res.string.unknown_error)) },
      )

      // Dismiss for a fatal error here MUST exit the application.
      // That is the viewModel's responsibility to set that up.
      AlertModal(
        visible = state.fatalError != null,
        onClose = { viewModel.dismissError() },
        title = { Text(stringResource(state.fatalError?.resource ?: Res.string.unknown_error)) },
      )

      if (state.fatalError == null) {
        NavHost(
          navController,
          startDestination = getStartupRoute(),
          modifier = Modifier.fillMaxSize().background(MaterialTheme.colorScheme.surface),
        ) {
          routes(navController)
        }
      }
    }
  }
}
