@file:OptIn(ExperimentalUuidApi::class, ExperimentalMaterial3Api::class)

package org.sleepingcats.bridgecmdr.ui.view

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.absoluteOffset
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.ListItem
import androidx.compose.material3.ListItemDefaults
import androidx.compose.material3.LocalTextStyle
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TooltipAnchorPosition
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Alignment.Companion.BottomEnd
import androidx.compose.ui.Alignment.Companion.CenterHorizontally
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.input.nestedscroll.nestedScroll
import androidx.compose.ui.unit.dp
import androidx.compose.ui.zIndex
import androidx.navigation.NavController
import bridgecmdr.composeapp.generated.resources.Res
import bridgecmdr.composeapp.generated.resources.action_delete
import bridgecmdr.composeapp.generated.resources.action_keep
import bridgecmdr.composeapp.generated.resources.delete
import bridgecmdr.composeapp.generated.resources.export
import bridgecmdr.composeapp.generated.resources.import
import bridgecmdr.composeapp.generated.resources.plus
import bridgecmdr.composeapp.generated.resources.source_title
import bridgecmdr.composeapp.generated.resources.ties_addTie
import bridgecmdr.composeapp.generated.resources.ties_audio
import bridgecmdr.composeapp.generated.resources.ties_deleteTie
import bridgecmdr.composeapp.generated.resources.ties_doYouWantToDeleteTie
import bridgecmdr.composeapp.generated.resources.ties_input
import bridgecmdr.composeapp.generated.resources.ties_noTies
import bridgecmdr.composeapp.generated.resources.ties_source
import bridgecmdr.composeapp.generated.resources.ties_ties
import bridgecmdr.composeapp.generated.resources.ties_video
import bridgecmdr.composeapp.generated.resources.unknown_device
import bridgecmdr.composeapp.generated.resources.unknown_error
import bridgecmdr.composeapp.generated.resources.volume_medium
import kotlinx.coroutines.launch
import org.jetbrains.compose.resources.painterResource
import org.jetbrains.compose.resources.stringResource
import org.koin.compose.viewmodel.koinViewModel
import org.koin.core.parameter.parametersOf
import org.sleepingcats.bridgecmdr.common.extension.invoke
import org.sleepingcats.bridgecmdr.common.service.model.Capabilities
import org.sleepingcats.bridgecmdr.common.service.model.Source
import org.sleepingcats.bridgecmdr.common.service.model.Tie
import org.sleepingcats.bridgecmdr.ui.EditTie
import org.sleepingcats.bridgecmdr.ui.Route
import org.sleepingcats.bridgecmdr.ui.Ties
import org.sleepingcats.bridgecmdr.ui.component.AlertModal
import org.sleepingcats.bridgecmdr.ui.component.BackButton
import org.sleepingcats.bridgecmdr.ui.component.ConfirmModal
import org.sleepingcats.bridgecmdr.ui.component.ImagePreview
import org.sleepingcats.bridgecmdr.ui.component.InputModal
import org.sleepingcats.bridgecmdr.ui.component.LoadingOverlay
import org.sleepingcats.bridgecmdr.ui.component.SimpleTooltip
import org.sleepingcats.bridgecmdr.ui.component.hideOnScroll
import org.sleepingcats.bridgecmdr.ui.components.rememberImagePickerLauncher
import org.sleepingcats.bridgecmdr.ui.view.model.TieListViewModel
import kotlin.uuid.ExperimentalUuidApi
import kotlin.uuid.Uuid

@Composable
fun TieListRoute(
  navController: NavController,
  parent: Ties,
) {
  TieListView(
    sourceId = Uuid.parseHexDash(parent.sourceId),
    goBack = { navController.popBackStack() },
    goTo = { r -> navController.navigate(r) },
  )
}

@Composable
fun TieListView(
  sourceId: Uuid,
  goBack: () -> Unit,
  goTo: (Route) -> Unit,
  viewModel: TieListViewModel = koinViewModel { parametersOf(sourceId) },
) {
  val isLoading by viewModel.isLoading.collectAsState()
  val state by viewModel.state.collectAsState()

  LoadingOverlay(isLoading)

  val scope = rememberCoroutineScope()
  val pickImage =
    rememberImagePickerLauncher { file ->
      if (file != null) {
        scope.launch {
          val imageId = viewModel.uploadImage(file) ?: return@launch
          viewModel.partialUpdateSource(sourceId, Source.Update(image = imageId)) { viewModel.refresh() }
        }
      }
    }

  val editTitle =
    InputModal(label = { Text(stringResource(Res.string.source_title)) }) { value ->
      if (value != null) {
        scope.launch {
          viewModel.partialUpdateSource(sourceId, Source.Update(title = value)) { viewModel.refresh() }
        }
      }
    }

  fun addTie() = goTo(EditTie(null))

  fun editTie(tie: Tie) = goTo(EditTie(tie.id.toHexDashString()))

  val deleteTie =
    ConfirmModal<Tie>(
      title = { Text(stringResource(Res.string.ties_doYouWantToDeleteTie)) },
      confirmButton = { confirm -> TextButton(onClick = confirm) { Text(stringResource(Res.string.action_delete)) } },
      cancelButton = { cancel -> TextButton(onClick = cancel) { Text(stringResource(Res.string.action_keep)) } },
    ) { tie, confirm -> if (confirm == true) scope.launch { viewModel.deleteTie(tie) { viewModel.refresh() } } }

  val showActions = rememberSaveable { mutableStateOf(true) }
  val connection = hideOnScroll(showActions)

  val tieListColor = ListItemDefaults.colors().copy(containerColor = MaterialTheme.colorScheme.surfaceContainer)

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

  Surface {
    Box(modifier = Modifier.fillMaxSize()) {
      BackButton(goBack, modifier = Modifier.absoluteOffset(4.dp, 8.dp).zIndex(1f))
      Box(modifier = Modifier.align(BottomEnd).absoluteOffset((-16).dp, (-16).dp).zIndex(1f)) {
        SimpleTooltip(
          position = TooltipAnchorPosition.Start,
          tooltip = { Text(stringResource(Res.string.ties_addTie)) },
        ) {
          AnimatedVisibility(visible = showActions.value, enter = fadeIn(), exit = fadeOut()) {
            FloatingActionButton(onClick = { addTie() }) {
              Icon(painterResource(Res.drawable.plus), stringResource(Res.string.ties_addTie))
            }
          }
        }
      }

      Column(
        modifier =
          Modifier
            .fillMaxSize()
            .padding(horizontal = 16.dp)
            .nestedScroll(connection)
            .verticalScroll(rememberScrollState()),
      ) {
        ImagePreview(
          model = state.source.image,
          onClick = { pickImage() },
          modifier =
            Modifier
              .align(CenterHorizontally)
              .padding(12.dp),
        )
        ListItem(
          modifier = Modifier.clickable { editTitle(state.source.title) },
          headlineContent = { Text(state.source.title) },
          supportingContent = { Text(stringResource(Res.string.ties_source)) },
        )
        Column(
          modifier =
            Modifier
              .fillMaxWidth()
              .padding(vertical = 12.dp)
              .padding(bottom = 32.dp)
              .clip(MaterialTheme.shapes.medium)
              .background(MaterialTheme.colorScheme.surfaceContainer)
              .padding(top = 16.dp),
        ) {
          Text(
            stringResource(Res.string.ties_ties),
            style = MaterialTheme.typography.bodyMedium,
            modifier =
              Modifier
                .padding(horizontal = 16.dp)
                .padding(bottom = 16.dp),
          )

          if (state.ties.isEmpty()) {
            return@Column ListItem(
              headlineContent = {
                Text(
                  text = stringResource(Res.string.ties_noTies),
                  color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.38f),
                )
              },
              colors = tieListColor,
            )
          }
          for (tie in state.ties) {
            val device = state.devices.find { it.id == tie.deviceId }
            val driver = device?.let { state.drivers.find { it.id == device.driverId } }
            ListItem(
              modifier = Modifier.clickable { editTie(tie) },
              headlineContent = { Text(device?.title ?: stringResource(Res.string.unknown_device)) },
              supportingContent = {
                Column {
                  Text(driver?.title ?: "Unknown driver")
                  CompositionLocalProvider(LocalTextStyle provides MaterialTheme.typography.bodySmall) {
                    Row(modifier = Modifier.padding(top = 1.dp)) {
                      Row(
                        modifier =
                          Modifier
                            .clip(MaterialTheme.shapes.extraSmall)
                            .background(MaterialTheme.colorScheme.surfaceContainerHighest)
                            .padding(horizontal = 4.dp, vertical = 2.dp),
                      ) {
                        Icon(
                          painterResource(Res.drawable.import),
                          contentDescription = stringResource(Res.string.ties_input),
                          modifier = Modifier.size(16.dp).padding(end = 2.dp),
                        )
                        Text("${tie.inputChannel}")
                      }
                      if (driver?.capabilities?.and(Capabilities.MULTIPLE_OUTPUTS) == Capabilities.MULTIPLE_OUTPUTS) {
                        Row(
                          modifier =
                            Modifier
                              .padding(start = 4.dp)
                              .clip(MaterialTheme.shapes.extraSmall)
                              .background(MaterialTheme.colorScheme.surfaceContainerHighest)
                              .padding(horizontal = 4.dp, vertical = 2.dp),
                        ) {
                          Icon(
                            painterResource(Res.drawable.export),
                            contentDescription = stringResource(Res.string.ties_video),
                            modifier = Modifier.size(16.dp).padding(end = 2.dp),
                          )
                          Text("${tie.outputVideoChannel ?: tie.inputChannel}")
                        }

                        if (driver.capabilities and Capabilities.AUDIO_INDEPENDENT == Capabilities.AUDIO_INDEPENDENT) {
                          Row(
                            modifier =
                              Modifier
                                .padding(start = 4.dp)
                                .clip(MaterialTheme.shapes.extraSmall)
                                .background(MaterialTheme.colorScheme.surfaceContainerHighest)
                                .padding(horizontal = 4.dp, vertical = 2.dp),
                          ) {
                            Icon(
                              painterResource(Res.drawable.volume_medium),
                              contentDescription = stringResource(Res.string.ties_audio),
                              modifier = Modifier.size(16.dp).padding(end = 2.dp),
                            )
                            Text("${tie.outputAudioChannel ?: tie.outputVideoChannel ?: tie.inputChannel}")
                          }
                        }
                      }
                    }
                  }
                }
              },
              trailingContent = {
                SimpleTooltip(
                  position = TooltipAnchorPosition.Start,
                  tooltip = { Text(stringResource(Res.string.ties_deleteTie)) },
                ) {
                  IconButton(onClick = { deleteTie(tie) }) {
                    Icon(
                      painterResource(Res.drawable.delete),
                      contentDescription = stringResource(Res.string.ties_deleteTie),
                    )
                  }
                }
              },
              colors = tieListColor,
            )
          }
        }
      }
    }
  }
}
