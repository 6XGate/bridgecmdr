@file:OptIn(ExperimentalMaterial3Api::class)

package org.sleepingcats.bridgecmdr.ui.view

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.ListItem
import androidx.compose.material3.LocalTextStyle
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Modifier
import androidx.navigation.NavController
import bridgecmdr.composeapp.generated.resources.Res
import bridgecmdr.composeapp.generated.resources.branding_appName
import bridgecmdr.composeapp.generated.resources.exit_run
import bridgecmdr.composeapp.generated.resources.power
import bridgecmdr.composeapp.generated.resources.power_socket
import bridgecmdr.composeapp.generated.resources.refresh_auto
import bridgecmdr.composeapp.generated.resources.server_network
import bridgecmdr.composeapp.generated.resources.server_outline
import bridgecmdr.composeapp.generated.resources.setting_AppTheme
import bridgecmdr.composeapp.generated.resources.setting_IconSize
import bridgecmdr.composeapp.generated.resources.setting_IconSize_Size
import bridgecmdr.composeapp.generated.resources.setting_PowerOffTaps
import bridgecmdr.composeapp.generated.resources.setting_PowerOffTaps_supporting
import bridgecmdr.composeapp.generated.resources.setting_autoStart
import bridgecmdr.composeapp.generated.resources.setting_autoStart_false
import bridgecmdr.composeapp.generated.resources.setting_autoStart_true
import bridgecmdr.composeapp.generated.resources.setting_close_application
import bridgecmdr.composeapp.generated.resources.setting_close_application_support
import bridgecmdr.composeapp.generated.resources.setting_powerOnDevices
import bridgecmdr.composeapp.generated.resources.setting_powerOnDevices_false
import bridgecmdr.composeapp.generated.resources.setting_powerOnDevices_true
import bridgecmdr.composeapp.generated.resources.setting_server
import bridgecmdr.composeapp.generated.resources.setting_server_status
import bridgecmdr.composeapp.generated.resources.setting_server_support
import bridgecmdr.composeapp.generated.resources.settings_general
import bridgecmdr.composeapp.generated.resources.theme_light_dark
import bridgecmdr.composeapp.generated.resources.view_dashboard
import kotlinx.coroutines.launch
import org.jetbrains.compose.resources.painterResource
import org.jetbrains.compose.resources.stringResource
import org.koin.compose.viewmodel.koinViewModel
import org.sleepingcats.bridgecmdr.common.setting.AppTheme
import org.sleepingcats.bridgecmdr.common.setting.IconSize
import org.sleepingcats.bridgecmdr.common.setting.PowerOffTaps
import org.sleepingcats.bridgecmdr.server.ServerStatus
import org.sleepingcats.bridgecmdr.ui.component.BackButton
import org.sleepingcats.bridgecmdr.ui.component.LoadingOverlay
import org.sleepingcats.bridgecmdr.ui.component.SelectModal
import org.sleepingcats.bridgecmdr.ui.view.model.GeneralSettingsViewModel

@Composable
fun GeneralSettingsRoute(navController: NavController) = GeneralSettingsView(goBack = { navController.popBackStack() })

@Composable
private fun GeneralSettingsView(
  goBack: () -> Unit,
  viewModel: GeneralSettingsViewModel = koinViewModel(),
) {
  val isLoading by viewModel.isLoading.collectAsState()
  val state by viewModel.state.collectAsState()

  LoadingOverlay(isLoading)

  val serverIcon =
    when (state.serverStatus) {
      is ServerStatus.Stopped -> Res.drawable.server_outline
      is ServerStatus.Starting -> Res.drawable.server_outline
      is ServerStatus.Running -> Res.drawable.server_network
      is ServerStatus.Stopping -> Res.drawable.server_network
    }

  val serverRowEnabled =
    when (state.serverStatus) {
      is ServerStatus.Stopped -> true
      is ServerStatus.Starting -> false
      is ServerStatus.Running -> true
      is ServerStatus.Stopping -> false
    }

  val scope = rememberCoroutineScope()

  val selectIconSize =
    SelectModal(
      itemContent = { stringResource(Res.string.setting_IconSize_Size, it.size) },
      items = IconSize.entries,
    ) { value -> if (value != null) scope.launch { viewModel.setIconSize(value) } }

  val selectColorTheme =
    SelectModal(
      itemContent = { stringResource(it.option) },
      items = AppTheme.entries,
    ) { value -> if (value != null) scope.launch { viewModel.setAppTheme(value) } }

  val selectPowerOffTaps =
    SelectModal(
      supportContent = { Text(stringResource(Res.string.setting_PowerOffTaps_supporting)) },
      itemContent = { stringResource(it.option) },
      items = PowerOffTaps.entries,
    ) { value -> if (value != null) scope.launch { viewModel.setPowerOffTaps(value) } }

  fun toggleAutoRun() =
    scope.launch {
      if (state.autoRun) {
        viewModel.disableAutoRun()
      } else {
        viewModel.enableAutoRun()
      }
    }

  fun togglePowerOnDevicesAtStart() =
    scope.launch {
      viewModel.setPowerOnDevicesAtStart(!state.powerOnDevicesAtStart)
    }

  fun toggleServer() =
    scope.launch {
      viewModel.setRunServer(!state.runServer)
    }

  val appName = stringResource(Res.string.branding_appName)

  Scaffold(
    modifier = Modifier.fillMaxSize(),
    topBar = {
      TopAppBar(
        navigationIcon = { BackButton(goBack) },
        title = { Text(stringResource(Res.string.settings_general)) },
      )
    },
  ) { paddingValues ->
    Column(modifier = Modifier.padding(paddingValues).verticalScroll(rememberScrollState())) {
      ListItem( // TODO: Need to support auto start on JVM only platforms
        modifier = Modifier.clickable { toggleAutoRun() },
        leadingContent = { Icon(painterResource(Res.drawable.refresh_auto), contentDescription = null) },
        headlineContent = { Text(stringResource(Res.string.setting_autoStart)) },
        supportingContent = {
          Text(
            when (state.autoRun) {
              true -> stringResource(Res.string.setting_autoStart_true, appName)
              false -> stringResource(Res.string.setting_autoStart_false, appName)
            },
          )
        },
        trailingContent = { Switch(checked = state.autoRun, onCheckedChange = { toggleAutoRun() }) },
      )
      ListItem(
        modifier = Modifier.clickable { selectIconSize(state.iconSize) },
        leadingContent = { Icon(painterResource(Res.drawable.view_dashboard), contentDescription = null) },
        headlineContent = { Text(stringResource(Res.string.setting_IconSize)) },
        supportingContent = { Text(stringResource(Res.string.setting_IconSize_Size, state.iconSize.size)) },
      )
      ListItem(
        modifier = Modifier.clickable { selectColorTheme(state.appTheme) },
        leadingContent = { Icon(painterResource(Res.drawable.theme_light_dark), contentDescription = null) },
        headlineContent = { Text(stringResource(Res.string.setting_AppTheme)) },
        supportingContent = { Text(stringResource(state.appTheme.description)) },
      )
      ListItem(
        modifier = Modifier.clickable { selectPowerOffTaps(state.powerOffTaps) },
        leadingContent = { Icon(painterResource(Res.drawable.power), contentDescription = null) },
        headlineContent = { Text(stringResource(Res.string.setting_PowerOffTaps)) },
        supportingContent = { Text(stringResource(state.powerOffTaps.description)) },
      )
      ListItem(
        modifier = Modifier.clickable { togglePowerOnDevicesAtStart() },
        leadingContent = { Icon(painterResource(Res.drawable.power_socket), contentDescription = null) },
        headlineContent = { Text(stringResource(Res.string.setting_powerOnDevices)) },
        supportingContent = {
          Text(
            stringResource(
              if (state.powerOnDevicesAtStart) {
                Res.string.setting_powerOnDevices_true
              } else {
                Res.string.setting_powerOnDevices_false
              },
              appName,
            ),
          )
        },
        trailingContent = {
          Switch(checked = state.powerOnDevicesAtStart, onCheckedChange = { togglePowerOnDevicesAtStart() })
        },
      )

      ListItem(
        modifier = Modifier.clickable(enabled = serverRowEnabled) { toggleServer() },
        leadingContent = { Icon(painterResource(serverIcon), contentDescription = null) },
        headlineContent = { Text(stringResource(Res.string.setting_server)) },
        supportingContent = {
          Column {
            Text(stringResource(Res.string.setting_server_support))
            CompositionLocalProvider(LocalTextStyle provides MaterialTheme.typography.bodySmall) {
              Text(
                stringResource(Res.string.setting_server_status, stringResource(state.serverStatus.resource)),
              )
            }
          }
        },
        trailingContent = { Switch(checked = state.runServer, onCheckedChange = { toggleServer() }) },
      )
      ListItem(
        modifier = Modifier.clickable { viewModel.exitApplication() },
        leadingContent = { Icon(painterResource(Res.drawable.exit_run), contentDescription = null) },
        headlineContent = { Text(stringResource(Res.string.setting_close_application, appName)) },
        supportingContent = { Text(stringResource(Res.string.setting_close_application_support, appName)) },
      )
    }
  }
}
