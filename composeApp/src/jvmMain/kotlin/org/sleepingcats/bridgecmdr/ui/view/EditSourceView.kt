@file:OptIn(ExperimentalUuidApi::class)

package org.sleepingcats.bridgecmdr.ui.view

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.navigation.NavController
import bridgecmdr.composeapp.generated.resources.Res
import bridgecmdr.composeapp.generated.resources.action_add
import bridgecmdr.composeapp.generated.resources.action_close
import bridgecmdr.composeapp.generated.resources.action_save
import bridgecmdr.composeapp.generated.resources.close
import bridgecmdr.composeapp.generated.resources.source_addSource
import bridgecmdr.composeapp.generated.resources.source_editSource
import bridgecmdr.composeapp.generated.resources.source_title
import bridgecmdr.composeapp.generated.resources.source_title_maxLength
import bridgecmdr.composeapp.generated.resources.source_title_notBlank
import bridgecmdr.composeapp.generated.resources.unknown_error
import kotlinx.coroutines.launch
import org.jetbrains.compose.resources.painterResource
import org.jetbrains.compose.resources.stringResource
import org.koin.compose.viewmodel.koinViewModel
import org.koin.core.parameter.parametersOf
import org.sleepingcats.bridgecmdr.common.extension.invoke
import org.sleepingcats.bridgecmdr.ui.EditSource
import org.sleepingcats.bridgecmdr.ui.Route
import org.sleepingcats.bridgecmdr.ui.Ties
import org.sleepingcats.bridgecmdr.ui.component.AlertModal
import org.sleepingcats.bridgecmdr.ui.component.ImagePreview
import org.sleepingcats.bridgecmdr.ui.component.LoadingOverlay
import org.sleepingcats.bridgecmdr.ui.component.errorIconOf
import org.sleepingcats.bridgecmdr.ui.component.from
import org.sleepingcats.bridgecmdr.ui.component.hintsOf
import org.sleepingcats.bridgecmdr.ui.component.isErrored
import org.sleepingcats.bridgecmdr.ui.component.minHeighBugFixForOutlinedTextField
import org.sleepingcats.bridgecmdr.ui.components.rememberImagePickerLauncher
import org.sleepingcats.bridgecmdr.ui.scaffold.FullscreenModalScaffold
import org.sleepingcats.bridgecmdr.ui.view.model.EditSourceViewModel
import kotlin.uuid.ExperimentalUuidApi
import kotlin.uuid.Uuid

@Composable
fun EditSourceRoute(
  navController: NavController,
  route: EditSource,
) {
  EditSourceView(
    sourceId = route.sourceId?.let { Uuid.parseHexDash(it) } ?: Uuid.NIL,
    goBack = { navController.popBackStack() },
    goTo = { route ->
      // Navigate to the new route, popping the current one to avoid jumping back to this view.
      navController.navigate(route) {
        popUpTo(navController.currentBackStackEntry?.destination?.route ?: return@navigate) {
          inclusive = true
        }
      }
    },
  )
}

@Composable
fun EditSourceView(
  sourceId: Uuid,
  goBack: () -> Unit,
  goTo: (Route) -> Unit,
  viewModel: EditSourceViewModel = koinViewModel { parametersOf(sourceId) },
) {
  val isLoading by viewModel.isLoading.collectAsState()

  val state by viewModel.state.collectAsState()
  val title by viewModel.title.collectAsState()
  val image by viewModel.image.collectAsState()

  val modalTitle =
    when (viewModel.id) {
      Uuid.NIL -> Res.string.source_addSource
      else -> Res.string.source_editSource
    }

  val modalConfirmLabel =
    when (viewModel.id) {
      Uuid.NIL -> Res.string.action_add
      else -> Res.string.action_save
    }

  val hints =
    hintsOf(
      Res.string.source_title_notBlank,
      Res.string.source_title_maxLength,
    )

  // Bugfix for layout issue with OutlinedTextField and minLines/maxLines/singleLine
  val minHeight = minHeighBugFixForOutlinedTextField(withSupportText = true)

  LoadingOverlay(isLoading)

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

  val scope = rememberCoroutineScope()
  val pickImage =
    rememberImagePickerLauncher { file ->
      if (file != null) {
        scope.launch {
          val imageId = viewModel.uploadImage(file) ?: return@launch
          viewModel.setImage(imageId)
        }
      }
    }

  FullscreenModalScaffold(
    titleContent = { Text(stringResource(modalTitle)) },
    navigationIcon = {
      IconButton(onClick = { goBack() }) {
        Icon(painterResource(Res.drawable.close), contentDescription = stringResource(Res.string.action_close))
      }
    },
    actions = {
      TextButton(onClick = { viewModel.save { goTo(Ties(it.id.toHexDashString())) } }) {
        Text(stringResource(modalConfirmLabel))
      }
    },
  ) {
    OutlinedTextField(
      modifier = Modifier.fillMaxWidth().height(minHeight),
      label = { Text(stringResource(Res.string.source_title)) },
      singleLine = true,
      value = title,
      isError = isErrored(state.titleError),
      onValueChange = { viewModel.setTitle(it.take(255)) },
      supportingText = { Text((state.titleError from hints) ?: "") },
      trailingIcon = errorIconOf(state.titleError),
    )
    ImagePreview(
      model = image,
      onClick = { pickImage() },
      modifier = Modifier.align(Alignment.CenterHorizontally),
      containerColor = MaterialTheme.colorScheme.surfaceContainerHighest,
      hoverContainerColor = MaterialTheme.colorScheme.surfaceContainerHigh,
    )
  }
}
