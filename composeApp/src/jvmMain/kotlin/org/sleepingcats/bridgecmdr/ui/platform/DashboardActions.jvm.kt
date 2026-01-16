@file:OptIn(ExperimentalMaterial3Api::class)

package org.sleepingcats.bridgecmdr.ui.platform

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.onClick
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ExtendedFloatingActionButton
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.material3.TooltipAnchorPosition
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import bridgecmdr.composeapp.generated.resources.Res
import bridgecmdr.composeapp.generated.resources.button_power
import bridgecmdr.composeapp.generated.resources.power
import bridgecmdr.composeapp.generated.resources.qrcode
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import org.jetbrains.compose.resources.painterResource
import org.jetbrains.compose.resources.stringResource
import org.koin.compose.koinInject
import org.koin.compose.viewmodel.koinViewModel
import org.sleepingcats.bridgecmdr.common.setting.PowerOffTaps
import org.sleepingcats.bridgecmdr.server.ServerController
import org.sleepingcats.bridgecmdr.server.ServerStatus.Running
import org.sleepingcats.bridgecmdr.server.ServerStatus.Stopped
import org.sleepingcats.bridgecmdr.ui.Route
import org.sleepingcats.bridgecmdr.ui.ServerCode
import org.sleepingcats.bridgecmdr.ui.component.SimpleTooltip
import org.sleepingcats.bridgecmdr.ui.view.model.DashboardViewModel
import org.sleepingcats.bridgecmdr.ui.view.model.DesktopDashboardViewModel

@Composable
actual fun ColumnScope.PlatformDashboardActions(
  goTo: (route: Route) -> Unit,
  startOver: (route: Route) -> Unit,
) {
  // HACK: To ensure only a single instance of this view model is created within the dashboard
  // view, we need to use the same class type. Since multiple bindings are seen as
  // different keys for this, just cast it after we get it to the expected type.
  val viewModel = koinViewModel<DashboardViewModel>() as DesktopDashboardViewModel
  val serverController: ServerController = koinInject()

  val status by serverController.status.collectAsState(Stopped)
  val state by viewModel.state.collectAsState()
  val scope = rememberCoroutineScope()

  val (expandPowerButton, setExpandPowerButton) = remember { mutableStateOf(false) }

  AnimatedVisibility(status is Running, enter = fadeIn(), exit = fadeOut()) {
    SimpleTooltip(
      position = TooltipAnchorPosition.Start,
      tooltip = { Text("Access remote server") },
    ) {
      FloatingActionButton(
        modifier = Modifier.padding(top = 16.dp),
        onClick = { goTo(ServerCode) },
      ) { Icon(painterResource(Res.drawable.qrcode), contentDescription = "Access remote server") }
    }
  }
  SimpleTooltip(
    position = TooltipAnchorPosition.Start,
    tooltip = { Text(stringResource(Res.string.button_power)) },
  ) {
    ExtendedFloatingActionButton(
      modifier = Modifier.padding(top = 16.dp),
      icon = {
        Icon(
          painterResource(Res.drawable.power),
          contentDescription = stringResource(Res.string.button_power),
        )
      },
      text = { Text(stringResource(Res.string.button_power)) },
      onClick =
        when (state.powerOffTaps) {
          PowerOffTaps.Single -> {
            { viewModel.powerOff() }
          }

          PowerOffTaps.Double -> {
            {
              // Rather hacky way to implement this since the FAB consumes the
              // pointer input gestures. But it is more tunable this way.
              if (expandPowerButton) {
                viewModel.powerOff()
              } else {
                scope.launch {
                  setExpandPowerButton(true)
                  delay(2000)
                  setExpandPowerButton(false)
                }
              }
            }
          }
        },
      expanded = expandPowerButton,
    )
  }
}
