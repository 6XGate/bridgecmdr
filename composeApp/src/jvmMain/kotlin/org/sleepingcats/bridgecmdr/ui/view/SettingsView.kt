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
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.navigation.NavController
import bridgecmdr.composeapp.generated.resources.Res
import bridgecmdr.composeapp.generated.resources.branding_appName
import bridgecmdr.composeapp.generated.resources.cogs
import bridgecmdr.composeapp.generated.resources.controller_classic
import bridgecmdr.composeapp.generated.resources.information
import bridgecmdr.composeapp.generated.resources.message_loading
import bridgecmdr.composeapp.generated.resources.settings
import bridgecmdr.composeapp.generated.resources.settings_about
import bridgecmdr.composeapp.generated.resources.settings_about_support
import bridgecmdr.composeapp.generated.resources.settings_backups
import bridgecmdr.composeapp.generated.resources.settings_backups_support
import bridgecmdr.composeapp.generated.resources.settings_devices
import bridgecmdr.composeapp.generated.resources.settings_devices_support
import bridgecmdr.composeapp.generated.resources.settings_general
import bridgecmdr.composeapp.generated.resources.settings_general_support
import bridgecmdr.composeapp.generated.resources.settings_sources
import bridgecmdr.composeapp.generated.resources.settings_sources_support
import bridgecmdr.composeapp.generated.resources.swap_vertical
import bridgecmdr.composeapp.generated.resources.video_switch
import org.jetbrains.compose.resources.painterResource
import org.jetbrains.compose.resources.pluralStringResource
import org.jetbrains.compose.resources.stringResource
import org.koin.compose.viewmodel.koinViewModel
import org.sleepingcats.bridgecmdr.Branding
import org.sleepingcats.bridgecmdr.ui.BackupManager
import org.sleepingcats.bridgecmdr.ui.DeviceList
import org.sleepingcats.bridgecmdr.ui.GeneralSettings
import org.sleepingcats.bridgecmdr.ui.Route
import org.sleepingcats.bridgecmdr.ui.SourceList
import org.sleepingcats.bridgecmdr.ui.component.BackButton
import org.sleepingcats.bridgecmdr.ui.view.model.SettingsViewModel

@Composable
fun SettingsRoute(navController: NavController) =
  SettingsView(
    goBack = { navController.popBackStack() },
    goTo = { r -> navController.navigate(r) },
  )

@Composable
private fun SettingsView(
  goBack: () -> Unit,
  goTo: (Route) -> Unit,
  viewModel: SettingsViewModel = koinViewModel(),
) {
  val sourceCount by viewModel.sourceCount.collectAsState()
  val deviceCount by viewModel.deviceCount.collectAsState()

  val appName = stringResource(Res.string.branding_appName)

  Scaffold(
    modifier = Modifier.fillMaxSize(),
    topBar = {
      TopAppBar(
        navigationIcon = { BackButton(goBack) },
        title = { Text(stringResource(Res.string.settings)) },
      )
    },
  ) { paddingValues ->
    Column(modifier = Modifier.padding(paddingValues).verticalScroll(rememberScrollState())) {
      ListItem(
        leadingContent = { Icon(painterResource(Res.drawable.cogs), null) },
        headlineContent = { Text(stringResource(Res.string.settings_general)) },
        supportingContent = { Text(stringResource(Res.string.settings_general_support, appName)) },
        modifier = Modifier.clickable { goTo(GeneralSettings) },
      )
      ListItem(
        leadingContent = { Icon(painterResource(Res.drawable.controller_classic), null) },
        headlineContent = { Text(stringResource(Res.string.settings_sources)) },
        supportingContent = {
          when (val quantity = sourceCount) {
            null -> Text(stringResource(Res.string.message_loading))
            else -> Text(pluralStringResource(Res.plurals.settings_sources_support, quantity, quantity))
          }
        },
        modifier = Modifier.clickable { goTo(SourceList) },
      )
      ListItem(
        leadingContent = { Icon(painterResource(Res.drawable.video_switch), null) },
        headlineContent = { Text(stringResource(Res.string.settings_devices)) },
        supportingContent = {
          when (val quantity = deviceCount) {
            null -> Text(stringResource(Res.string.message_loading))
            else -> Text(pluralStringResource(Res.plurals.settings_devices_support, quantity, quantity))
          }
        },
        modifier = Modifier.clickable { goTo(DeviceList) },
      )
      ListItem(
        leadingContent = { Icon(painterResource(Res.drawable.swap_vertical), contentDescription = "Backup") },
        headlineContent = { Text(stringResource(Res.string.settings_backups)) },
        supportingContent = { Text(stringResource(Res.string.settings_backups_support)) },
        modifier = Modifier.clickable(onClick = { goTo(BackupManager) }),
      )
      ListItem(
        leadingContent = { Icon(painterResource(Res.drawable.information), null) },
        headlineContent = { Text(stringResource(Res.string.settings_about, appName)) },
        supportingContent = { Text(stringResource(Res.string.settings_about_support, Branding.version)) },
      )
    }
  }
}
