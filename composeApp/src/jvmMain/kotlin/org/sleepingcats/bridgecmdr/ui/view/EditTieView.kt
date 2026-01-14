@file:OptIn(ExperimentalUuidApi::class)

package org.sleepingcats.bridgecmdr.ui.view

import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.defaultMinSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment.Companion.CenterVertically
import androidx.compose.ui.Modifier
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import bridgecmdr.composeapp.generated.resources.Res
import bridgecmdr.composeapp.generated.resources.action_add
import bridgecmdr.composeapp.generated.resources.action_close
import bridgecmdr.composeapp.generated.resources.action_save
import bridgecmdr.composeapp.generated.resources.close
import bridgecmdr.composeapp.generated.resources.tie_addTie
import bridgecmdr.composeapp.generated.resources.tie_audioChannel_minimum
import bridgecmdr.composeapp.generated.resources.tie_deviceId_notNil
import bridgecmdr.composeapp.generated.resources.tie_editTie
import bridgecmdr.composeapp.generated.resources.tie_inputChannel_minimum
import bridgecmdr.composeapp.generated.resources.tie_videoChannel_minimum
import bridgecmdr.composeapp.generated.resources.unknown_error
import org.jetbrains.compose.resources.painterResource
import org.jetbrains.compose.resources.stringResource
import org.koin.compose.viewmodel.koinViewModel
import org.koin.core.parameter.parametersOf
import org.sleepingcats.bridgecmdr.common.service.model.Capabilities
import org.sleepingcats.bridgecmdr.ui.EditTie
import org.sleepingcats.bridgecmdr.ui.Ties
import org.sleepingcats.bridgecmdr.ui.component.AlertModal
import org.sleepingcats.bridgecmdr.ui.component.LoadingOverlay
import org.sleepingcats.bridgecmdr.ui.component.OutlinedNumericField
import org.sleepingcats.bridgecmdr.ui.component.OutlinedSelectField
import org.sleepingcats.bridgecmdr.ui.component.errorIconOf
import org.sleepingcats.bridgecmdr.ui.component.from
import org.sleepingcats.bridgecmdr.ui.component.hintsOf
import org.sleepingcats.bridgecmdr.ui.component.isErrored
import org.sleepingcats.bridgecmdr.ui.component.minHeighBugFixForOutlinedTextField
import org.sleepingcats.bridgecmdr.ui.scaffold.FullscreenModalScaffold
import org.sleepingcats.bridgecmdr.ui.view.model.EditTieViewModel
import kotlin.uuid.ExperimentalUuidApi
import kotlin.uuid.Uuid

@Composable
fun EditTieRoute(
  navController: NavController,
  parent: Ties,
  route: EditTie,
) {
  EditTieView(
    sourceId = Uuid.parseHexDash(parent.sourceId),
    tieId = route.tieId?.let { Uuid.parseHexDash(it) } ?: Uuid.NIL,
    goBack = { navController.popBackStack() },
  )
}

@Composable
fun EditTieView(
  sourceId: Uuid,
  tieId: Uuid,
  goBack: () -> Unit,
  viewModel: EditTieViewModel = koinViewModel { parametersOf(sourceId, tieId) },
) {
  val isLoading by viewModel.isLoading.collectAsState()
  val devices by viewModel.devices.collectAsState()

  val state by viewModel.state.collectAsState()
  val device by viewModel.device.collectAsState()
  val driver by viewModel.driver.collectAsState()
  val inputChannel by viewModel.inputChannel.collectAsState()
  val outputVideoChannel by viewModel.outputVideoChannel.collectAsState()
  val outputAudioChannel by viewModel.outputAudioChannel.collectAsState()

  val modalTitle =
    when (viewModel.id) {
      Uuid.NIL -> Res.string.tie_addTie
      else -> Res.string.tie_editTie
    }

  val modalConfirmLabel =
    when (viewModel.id) {
      Uuid.NIL -> Res.string.action_add
      else -> Res.string.action_save
    }

  val hints =
    hintsOf(
      Res.string.tie_deviceId_notNil,
      Res.string.tie_inputChannel_minimum,
      Res.string.tie_videoChannel_minimum,
      Res.string.tie_audioChannel_minimum,
    )

  // Bugfix for layout issue with OutlinedTextField and minLines/maxLines/singleLine
  minHeighBugFixForOutlinedTextField(withSupportText = true)

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

  FullscreenModalScaffold(
    titleContent = { Text(stringResource(modalTitle)) },
    navigationIcon = {
      IconButton(onClick = { goBack() }) {
        Icon(painterResource(Res.drawable.close), contentDescription = stringResource(Res.string.action_close))
      }
    },
    actions = {
      TextButton(onClick = { viewModel.save { goBack() } }) {
        Text(stringResource(modalConfirmLabel))
      }
    },
  ) {
    Row {
      OutlinedSelectField(
        modifier = Modifier.fillMaxWidth(),
        value = device,
        onValueChanged = { viewModel.setDevice(it) },
        label = { Text("Device") },
        isError = isErrored(state.deviceError),
        supportingText = { Text((state.deviceError from hints) ?: "") },
        trailingIcon = errorIconOf(state.deviceError),
        valueText = { it.title },
        options = devices,
      )
    }
    driver?.let { driver ->
      Row {
        OutlinedNumericField(
          value = inputChannel,
          onValueChanged = { viewModel.setInputChannel(it ?: 1) },
          modifier = Modifier.defaultMinSize(minWidth = 100.dp),
          label = { Text("Input Channel") },
          isError = isErrored(state.inputChannelError),
          supportingText = { Text((state.inputChannelError from hints) ?: "") },
          trailingIcon = errorIconOf(state.inputChannelError),
          minValue = 1,
        )
        if (driver.capabilities and Capabilities.MULTIPLE_OUTPUTS != 0) {
          OutlinedNumericField(
            value = outputVideoChannel,
            onValueChanged = { viewModel.setOutputVideoChannel(it) },
            modifier = Modifier.defaultMinSize(minWidth = 100.dp).padding(start = 12.dp),
            label = { Text("Video Channel") },
            isError = isErrored(state.outputVideoChannelError),
            supportingText = { Text((state.outputVideoChannelError from hints) ?: "") },
            trailingIcon = errorIconOf(state.outputVideoChannelError),
            minValue = 1,
          )
        }
      }
      if (driver.capabilities and Capabilities.AUDIO_INDEPENDENT != 0) {
        Row(verticalAlignment = CenterVertically) {
          val interactionSource = remember { MutableInteractionSource() }
          Switch(
            checked = outputAudioChannel == null,
            onCheckedChange = { viewModel.setOutputAudioChannel(if (it) null else outputVideoChannel) },
            interactionSource = interactionSource,
          )
          Text(
            "Synchronize audio and video channels",
            modifier =
              Modifier
                .padding(start = 12.dp)
                .clickable(
                  onClick = {
                    viewModel.setOutputAudioChannel(if (outputAudioChannel != null) null else outputVideoChannel)
                  },
                  interactionSource = interactionSource,
                  indication = null,
                  role = Role.Switch,
                ),
          )
        }
        Row {
          OutlinedNumericField(
            value = outputAudioChannel,
            onValueChanged = { viewModel.setOutputAudioChannel(it) },
            modifier = Modifier.defaultMinSize(minWidth = 100.dp),
            label = { Text("Audio Channel") },
            isError = isErrored(state.outputAudioChannelError),
            supportingText = { Text((state.outputAudioChannelError from hints) ?: "") },
            trailingIcon = errorIconOf(state.outputAudioChannelError),
            enabled = outputAudioChannel != null,
            minValue = 1,
          )
        }
      }
    }
  }
}
