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
import bridgecmdr.composeapp.generated.resources.backup_export
import bridgecmdr.composeapp.generated.resources.backup_export_supporting
import bridgecmdr.composeapp.generated.resources.backup_import
import bridgecmdr.composeapp.generated.resources.backup_import_supporting
import bridgecmdr.composeapp.generated.resources.backup_load
import bridgecmdr.composeapp.generated.resources.backup_suggestion
import bridgecmdr.composeapp.generated.resources.branding_appName
import bridgecmdr.composeapp.generated.resources.export
import bridgecmdr.composeapp.generated.resources.import
import bridgecmdr.composeapp.generated.resources.settings_backups
import bridgecmdr.composeapp.generated.resources.unknown_error
import io.github.vinceglb.filekit.dialogs.FileKitType
import io.github.vinceglb.filekit.dialogs.compose.rememberFilePickerLauncher
import io.github.vinceglb.filekit.dialogs.compose.rememberFileSaverLauncher
import kotlinx.coroutines.launch
import org.jetbrains.compose.resources.painterResource
import org.jetbrains.compose.resources.stringResource
import org.koin.compose.viewmodel.koinViewModel
import org.sleepingcats.bridgecmdr.common.extension.invoke
import org.sleepingcats.bridgecmdr.ui.component.AlertModal
import org.sleepingcats.bridgecmdr.ui.component.BackButton
import org.sleepingcats.bridgecmdr.ui.component.LoadingOverlay
import org.sleepingcats.bridgecmdr.ui.view.model.BackupManagerViewModel

@Composable
fun BackupManagerRoute(navController: NavController) {
  BackupManagerView(
    goBack = { navController.popBackStack() },
  )
}

@Composable
fun BackupManagerView(
  goBack: () -> Unit,
  viewModel: BackupManagerViewModel = koinViewModel(),
) {
  val isLoading by viewModel.isLoading.collectAsState()
  val state by viewModel.state.collectAsState()

  LoadingOverlay(isLoading)

  val scope = rememberCoroutineScope()

  val exportPickerLauncher = rememberFileSaverLauncher { file -> file?.let { scope.launch { viewModel.export(file) } } }

  val importPickerLauncher =
    rememberFilePickerLauncher(
      type = FileKitType.File("zip"),
      title = stringResource(Res.string.backup_load),
    ) { file -> file?.let { scope.launch { viewModel.import(file) } } }

  AlertModal(
    visible = state.error != null,
    onClose = { viewModel.dismissError() },
    title = { Text(stringResource(state.error?.resource ?: Res.string.unknown_error)) },
  )

  AlertModal(
    visible = state.fatalError != null,
    onClose = { goBack() },
    title = { Text(stringResource(state.fatalError?.resource ?: Res.string.unknown_error)) },
  )

  val appName = stringResource(Res.string.branding_appName)
  val backupSuggestion = stringResource(Res.string.backup_suggestion)

  Scaffold(
    modifier = Modifier.fillMaxSize(),
    topBar = {
      TopAppBar(
        navigationIcon = { BackButton(goBack) },
        title = { Text(stringResource(Res.string.settings_backups)) },
      )
    },
  ) { paddingValues ->
    Column(modifier = Modifier.padding(paddingValues).verticalScroll(rememberScrollState())) {
      ListItem(
        leadingContent = { Icon(painterResource(Res.drawable.export), null) },
        headlineContent = { Text(stringResource(Res.string.backup_export)) },
        supportingContent = { Text(stringResource(Res.string.backup_export_supporting, appName)) },
        modifier =
          Modifier.clickable {
            exportPickerLauncher.launch(
              suggestedName = backupSuggestion,
              extension = "zip",
            )
          },
      )
      ListItem(
        leadingContent = { Icon(painterResource(Res.drawable.import), null) },
        headlineContent = { Text(stringResource(Res.string.backup_import)) },
        supportingContent = { Text(stringResource(Res.string.backup_import_supporting, appName)) },
        modifier = Modifier.clickable { importPickerLauncher() },
      )
    }
  }
}
