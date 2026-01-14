@file:OptIn(ExperimentalUuidApi::class, ExperimentalMaterial3Api::class)

package org.sleepingcats.bridgecmdr.ui.view

import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TooltipAnchorPosition
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import bridgecmdr.composeapp.generated.resources.Res
import bridgecmdr.composeapp.generated.resources.action_add
import bridgecmdr.composeapp.generated.resources.action_close
import bridgecmdr.composeapp.generated.resources.action_save
import bridgecmdr.composeapp.generated.resources.close
import bridgecmdr.composeapp.generated.resources.device_addDevice
import bridgecmdr.composeapp.generated.resources.device_driver
import bridgecmdr.composeapp.generated.resources.device_driver_notNil
import bridgecmdr.composeapp.generated.resources.device_editDevice
import bridgecmdr.composeapp.generated.resources.device_experimentalDriver
import bridgecmdr.composeapp.generated.resources.device_hostname
import bridgecmdr.composeapp.generated.resources.device_pathType
import bridgecmdr.composeapp.generated.resources.device_path_noHostname
import bridgecmdr.composeapp.generated.resources.device_path_noPort
import bridgecmdr.composeapp.generated.resources.device_path_noType
import bridgecmdr.composeapp.generated.resources.device_port
import bridgecmdr.composeapp.generated.resources.device_title
import bridgecmdr.composeapp.generated.resources.device_title_maxLength
import bridgecmdr.composeapp.generated.resources.device_title_notBlank
import bridgecmdr.composeapp.generated.resources.flask
import bridgecmdr.composeapp.generated.resources.unknown_error
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import org.jetbrains.compose.resources.painterResource
import org.jetbrains.compose.resources.stringResource
import org.koin.compose.viewmodel.koinViewModel
import org.koin.core.parameter.parametersOf
import org.sleepingcats.bridgecmdr.common.service.model.PathType
import org.sleepingcats.bridgecmdr.ui.EditDevice
import org.sleepingcats.bridgecmdr.ui.component.AlertModal
import org.sleepingcats.bridgecmdr.ui.component.LoadingOverlay
import org.sleepingcats.bridgecmdr.ui.component.OutlinedSelectField
import org.sleepingcats.bridgecmdr.ui.component.SimpleTooltip
import org.sleepingcats.bridgecmdr.ui.component.errorIconOf
import org.sleepingcats.bridgecmdr.ui.component.from
import org.sleepingcats.bridgecmdr.ui.component.hintsOf
import org.sleepingcats.bridgecmdr.ui.component.isErrored
import org.sleepingcats.bridgecmdr.ui.component.minHeighBugFixForOutlinedTextField
import org.sleepingcats.bridgecmdr.ui.scaffold.FullscreenModalScaffold
import org.sleepingcats.bridgecmdr.ui.view.model.EditDeviceViewModel
import kotlin.uuid.ExperimentalUuidApi
import kotlin.uuid.Uuid

operator fun <T> MutableStateFlow<T>.component1(): StateFlow<T> = this.asStateFlow()

operator fun <T> MutableStateFlow<T>.component2(): (function: (T) -> T) -> Unit = { update(it) }

@Composable
fun EditDeviceRoute(
  navController: NavController,
  route: EditDevice,
) {
  EditDeviceView(
    deviceId = route.deviceId?.let { Uuid.parseHexDash(it) } ?: Uuid.NIL,
    goBack = { navController.popBackStack() },
  )
}

@Composable
fun EditDeviceView(
  deviceId: Uuid,
  goBack: () -> Unit,
  viewModel: EditDeviceViewModel = koinViewModel { parametersOf(deviceId) },
) {
  val isLoading by viewModel.isLoading.collectAsState()
  val drivers by viewModel.drivers.collectAsState()
  val ports by viewModel.ports.collectAsState()

  val state by viewModel.state.collectAsState()
  val title by viewModel.title.collectAsState()
  val driver by viewModel.driver.collectAsState()
  val pathType by viewModel.pathType.collectAsState()
  val hostname by viewModel.hostname.collectAsState()
  val port by viewModel.port.collectAsState()

  val modalTitle =
    when (viewModel.id) {
      Uuid.NIL -> Res.string.device_addDevice
      else -> Res.string.device_editDevice
    }

  val modalConfirmLabel =
    when (viewModel.id) {
      Uuid.NIL -> Res.string.action_add
      else -> Res.string.action_save
    }

  val hints =
    hintsOf(
      Res.string.device_title_notBlank,
      Res.string.device_title_maxLength,
      Res.string.device_driver_notNil,
      Res.string.device_path_noHostname,
      Res.string.device_path_noPort,
      Res.string.device_path_noType,
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
    OutlinedTextField(
      modifier = Modifier.fillMaxWidth().height(minHeight),
      label = { Text(stringResource(Res.string.device_title)) },
      singleLine = true,
      value = title,
      isError = isErrored(state.titleError),
      onValueChange = { viewModel.setTitle(it.take(255)) },
      supportingText = { Text((state.titleError from hints) ?: "") },
      trailingIcon = errorIconOf(state.titleError),
    )
    OutlinedSelectField(
      modifier = Modifier.fillMaxWidth(),
      value = driver,
      onValueChanged = { viewModel.setDriver(it) },
      label = { Text(stringResource(Res.string.device_driver)) },
      isError = isErrored(state.driverError),
      supportingText = { Text((state.driverError from hints) ?: "") },
      trailingIcon = errorIconOf(state.driverError),
      valueText = { it.title },
      options = drivers,
      optionKey = { it.id },
      optionContent = {
        Row {
          Text(
            modifier = Modifier.weight(1f, fill = true),
            text = it.title,
          )
          if (it.experimental) {
            SimpleTooltip(
              tooltip = { Text(stringResource(Res.string.device_experimentalDriver)) },
              position = TooltipAnchorPosition.Start,
            ) {
              Icon(
                painterResource(Res.drawable.flask),
                contentDescription = stringResource(Res.string.device_experimentalDriver),
                modifier = Modifier.size(16.dp),
              )
            }
          }
        }
      },
    )
    Row(modifier = Modifier.fillMaxWidth()) {
      OutlinedSelectField(
        modifier = Modifier.fillMaxWidth(0.3f).padding(top = 8.dp, end = 16.dp),
        value = pathType,
        onValueChanged = { viewModel.setPathType(it) },
        placeholder = { Text(stringResource(Res.string.device_pathType)) },
        isError = isErrored(state.pathTypeError),
        supportingText = { Text((state.pathTypeError from hints) ?: "") },
        trailingIcon = errorIconOf(state.pathTypeError),
        valueText = { stringResource(it.label) },
        options = PathType.entries,
      )
      when (pathType) {
        PathType.Port -> {
          OutlinedSelectField(
            modifier = Modifier.fillMaxWidth(),
            label = { Text(stringResource(Res.string.device_port)) },
            value = port,
            onValueChanged = { viewModel.setPort(it) },
            isError = isErrored(state.pathError),
            supportingText = { Text((state.pathError from hints) ?: "") },
            trailingIcon = errorIconOf(state.pathError),
            valueText = { "${it.manufacturer} ${it.title} ${it.serialNumber}" },
            options = ports,
          )
        }

        PathType.Remote -> {
          OutlinedTextField(
            modifier = Modifier.fillMaxWidth().height(minHeight),
            label = { Text(stringResource(Res.string.device_hostname)) },
            singleLine = true,
            value = hostname,
            onValueChange = { viewModel.setHostname(it.take(255 - PathType.Remote.prefix.length)) },
            isError = isErrored(state.pathError),
            supportingText = { Text((state.pathError from hints) ?: "") },
            trailingIcon = errorIconOf(state.pathError),
          )
        }

        null -> {
          OutlinedTextField(
            modifier = Modifier.fillMaxWidth().padding(top = 8.dp).height(minHeight - 8.dp),
            enabled = false,
            readOnly = true,
            singleLine = true,
            value = "",
            onValueChange = { },
            isError = isErrored(state.pathError),
            supportingText = { Text((state.pathError from hints) ?: "") },
            trailingIcon = errorIconOf(state.pathError),
          )
        }
      }
    }
  }
}
