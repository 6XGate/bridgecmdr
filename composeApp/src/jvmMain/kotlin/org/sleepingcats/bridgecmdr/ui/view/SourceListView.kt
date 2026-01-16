@file:OptIn(ExperimentalUuidApi::class, ExperimentalMaterial3Api::class)

package org.sleepingcats.bridgecmdr.ui.view

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.ListItem
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TooltipAnchorPosition
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Modifier
import androidx.compose.ui.input.nestedscroll.nestedScroll
import androidx.navigation.NavController
import bridgecmdr.composeapp.generated.resources.Res
import bridgecmdr.composeapp.generated.resources.action_delete
import bridgecmdr.composeapp.generated.resources.action_keep
import bridgecmdr.composeapp.generated.resources.delete
import bridgecmdr.composeapp.generated.resources.devices_doYouWantToDeleteSource
import bridgecmdr.composeapp.generated.resources.plus
import bridgecmdr.composeapp.generated.resources.settings_sources
import bridgecmdr.composeapp.generated.resources.sources_addSource
import bridgecmdr.composeapp.generated.resources.sources_deleteSource
import bridgecmdr.composeapp.generated.resources.unknown_error
import kotlinx.coroutines.launch
import org.jetbrains.compose.resources.painterResource
import org.jetbrains.compose.resources.stringResource
import org.koin.compose.viewmodel.koinViewModel
import org.sleepingcats.bridgecmdr.common.service.model.Source
import org.sleepingcats.bridgecmdr.ui.EditSource
import org.sleepingcats.bridgecmdr.ui.Route
import org.sleepingcats.bridgecmdr.ui.Ties
import org.sleepingcats.bridgecmdr.ui.component.AlertModal
import org.sleepingcats.bridgecmdr.ui.component.BackButton
import org.sleepingcats.bridgecmdr.ui.component.ConfirmModal
import org.sleepingcats.bridgecmdr.ui.component.LoadingOverlay
import org.sleepingcats.bridgecmdr.ui.component.MediaImage
import org.sleepingcats.bridgecmdr.ui.component.SimpleTooltip
import org.sleepingcats.bridgecmdr.ui.component.hideOnScroll
import org.sleepingcats.bridgecmdr.ui.view.model.SourceListViewModel
import kotlin.uuid.ExperimentalUuidApi

@Composable
fun SourceListRoute(navController: NavController) {
  SourceListView(
    goBack = { navController.popBackStack() },
    goTo = { r -> navController.navigate(r) },
  )
}

@Composable
internal fun SourceListView(
  goBack: () -> Unit,
  goTo: (Route) -> Unit,
  viewModel: SourceListViewModel = koinViewModel(),
) {
  val isLoading by viewModel.isLoading.collectAsState()
  val state by viewModel.state.collectAsState()

  LoadingOverlay(isLoading)

  fun listTies(source: Source) {
    goTo(Ties(source.id.toHexDashString()))
  }

  val scope = rememberCoroutineScope()

  fun addSource() {
    goTo(EditSource(null))
  }

  val deleteSource =
    ConfirmModal<Source>(
      title = { Text(stringResource(Res.string.devices_doYouWantToDeleteSource)) },
      confirmButton = { confirm -> TextButton(onClick = confirm) { Text(stringResource(Res.string.action_delete)) } },
      cancelButton = { cancel -> TextButton(onClick = cancel) { Text(stringResource(Res.string.action_keep)) } },
    ) { source, confirm -> if (confirm == true) scope.launch { viewModel.delete(source) } }

  val showActions = rememberSaveable { mutableStateOf(true) }
  val connection = hideOnScroll(showActions)

  AlertModal(
    visible = state.error != null,
    onClose = { viewModel.dismissError() },
    title = { Text(stringResource(state.error?.resource ?: Res.string.unknown_error)) },
  )

  // TODO: Support pull to refresh on errors.
  AlertModal(
    visible = state.fatalError != null,
    onClose = { goBack() },
    title = { Text(stringResource(state.fatalError?.resource ?: Res.string.unknown_error)) },
  )

  Scaffold(
    modifier = Modifier.fillMaxSize(),
    topBar = {
      TopAppBar(
        navigationIcon = { BackButton(goBack) },
        title = { Text(stringResource(Res.string.settings_sources)) },
      )
    },
    floatingActionButton = {
      SimpleTooltip(
        position = TooltipAnchorPosition.Start,
        tooltip = { Text(stringResource(Res.string.sources_addSource)) },
      ) {
        AnimatedVisibility(visible = showActions.value, enter = fadeIn(), exit = fadeOut()) {
          FloatingActionButton(onClick = { addSource() }) {
            Icon(painterResource(Res.drawable.plus), contentDescription = stringResource(Res.string.sources_addSource))
          }
        }
      }
    },
  ) { paddingValues ->
    LazyColumn(modifier = Modifier.padding(paddingValues).fillMaxSize().nestedScroll(connection)) {
      items(state.sources, key = { it.id }) { source ->
        ListItem(
          modifier = Modifier.clickable(enabled = !isLoading) { listTies(source) },
          leadingContent = { MediaImage(source.image, contentDescription = null) },
          headlineContent = { Text(source.title) },
          trailingContent = {
            SimpleTooltip(
              position = TooltipAnchorPosition.Start,
              tooltip = { Text(stringResource(Res.string.sources_deleteSource)) },
            ) {
              IconButton(onClick = { deleteSource(source) }) {
                Icon(
                  painterResource(Res.drawable.delete),
                  contentDescription = stringResource(Res.string.sources_deleteSource),
                )
              }
            }
          },
        )
      }
    }
  }
}
