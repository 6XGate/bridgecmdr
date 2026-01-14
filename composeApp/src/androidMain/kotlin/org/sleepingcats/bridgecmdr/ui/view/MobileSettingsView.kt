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
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Modifier
import androidx.navigation.NavController
import bridgecmdr.composeapp.generated.resources.Res
import bridgecmdr.composeapp.generated.resources.branding_appName
import bridgecmdr.composeapp.generated.resources.information
import bridgecmdr.composeapp.generated.resources.setting_AppTheme
import bridgecmdr.composeapp.generated.resources.setting_IconSize
import bridgecmdr.composeapp.generated.resources.setting_IconSize_Size
import bridgecmdr.composeapp.generated.resources.settings
import bridgecmdr.composeapp.generated.resources.settings_about
import bridgecmdr.composeapp.generated.resources.settings_about_support
import bridgecmdr.composeapp.generated.resources.theme_light_dark
import bridgecmdr.composeapp.generated.resources.view_dashboard
import kotlinx.coroutines.launch
import org.jetbrains.compose.resources.painterResource
import org.jetbrains.compose.resources.stringResource
import org.koin.compose.viewmodel.koinViewModel
import org.sleepingcats.bridgecmdr.Branding
import org.sleepingcats.bridgecmdr.common.setting.AppTheme
import org.sleepingcats.bridgecmdr.common.setting.IconSize
import org.sleepingcats.bridgecmdr.ui.component.BackButton
import org.sleepingcats.bridgecmdr.ui.component.LoadingOverlay
import org.sleepingcats.bridgecmdr.ui.component.SelectModal
import org.sleepingcats.bridgecmdr.ui.view.model.MobileSettingsViewModel

@Composable
fun MobileSettingsRoute(navController: NavController) = MobileSettingsView(goBack = { navController.popBackStack() })

@Composable
private fun MobileSettingsView(
  goBack: () -> Unit,
  viewModel: MobileSettingsViewModel = koinViewModel(),
) {
  val isLoading by viewModel.isLoading.collectAsState()
  val state by viewModel.state.collectAsState()

  LoadingOverlay(isLoading)

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
        leadingContent = { Icon(painterResource(Res.drawable.information), contentDescription = null) },
        headlineContent = { Text(stringResource(Res.string.settings_about, appName)) },
        supportingContent = { Text(stringResource(Res.string.settings_about_support, Branding.version)) },
      )
    }
  }
}
