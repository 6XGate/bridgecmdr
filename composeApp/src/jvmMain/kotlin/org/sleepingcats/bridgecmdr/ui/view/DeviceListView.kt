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
import bridgecmdr.composeapp.generated.resources.devices_addDevice
import bridgecmdr.composeapp.generated.resources.devices_deleteMonitor
import bridgecmdr.composeapp.generated.resources.devices_deleteSwitch
import bridgecmdr.composeapp.generated.resources.devices_deleteWarning
import bridgecmdr.composeapp.generated.resources.devices_doYouWantToDeleteDevice
import bridgecmdr.composeapp.generated.resources.devices_doYouWantToDeleteMonitor
import bridgecmdr.composeapp.generated.resources.devices_doYouWantToDeleteSwitch
import bridgecmdr.composeapp.generated.resources.monitor
import bridgecmdr.composeapp.generated.resources.plus
import bridgecmdr.composeapp.generated.resources.settings_devices
import bridgecmdr.composeapp.generated.resources.unknown_driver
import bridgecmdr.composeapp.generated.resources.unknown_error
import bridgecmdr.composeapp.generated.resources.video_switch
import kotlinx.coroutines.launch
import org.jetbrains.compose.resources.painterResource
import org.jetbrains.compose.resources.stringResource
import org.koin.compose.viewmodel.koinViewModel
import org.sleepingcats.bridgecmdr.common.service.model.Device
import org.sleepingcats.bridgecmdr.common.service.model.Driver
import org.sleepingcats.bridgecmdr.common.service.model.DriverKind
import org.sleepingcats.bridgecmdr.ui.EditDevice
import org.sleepingcats.bridgecmdr.ui.Route
import org.sleepingcats.bridgecmdr.ui.component.AlertModal
import org.sleepingcats.bridgecmdr.ui.component.BackButton
import org.sleepingcats.bridgecmdr.ui.component.ConfirmModal
import org.sleepingcats.bridgecmdr.ui.component.LoadingOverlay
import org.sleepingcats.bridgecmdr.ui.component.SimpleTooltip
import org.sleepingcats.bridgecmdr.ui.component.hideOnScroll
import org.sleepingcats.bridgecmdr.ui.view.model.DeviceListViewModel
import kotlin.uuid.ExperimentalUuidApi

@Composable
fun DeviceListRoute(navController: NavController) =
  DeviceListView(
    goBack = { navController.popBackStack() },
    goTo = { r -> navController.navigate(r) },
  )

@Composable
private fun DeviceListView(
  goBack: () -> Unit,
  goTo: (Route) -> Unit,
  viewModel: DeviceListViewModel = koinViewModel(),
) {
  val isLoading by viewModel.isLoading.collectAsState()
  val state by viewModel.state.collectAsState()

  LoadingOverlay(isLoading)

  val scope = rememberCoroutineScope()

  fun addDevice() = goTo(EditDevice(null))

  fun editDevice(device: Device) = goTo(EditDevice(device.id.toHexDashString()))

  fun deleteQuestion(driver: Driver?) =
    when (driver?.kind) {
      DriverKind.Monitor -> Res.string.devices_doYouWantToDeleteMonitor
      DriverKind.Switch -> Res.string.devices_doYouWantToDeleteSwitch
      else -> Res.string.devices_doYouWantToDeleteDevice
    }

  val deleteDevice =
    ConfirmModal<Pair<Device, Driver?>>(
      title = { (_, driver) -> Text(stringResource(deleteQuestion(driver))) },
      text = { Text(stringResource(Res.string.devices_deleteWarning)) },
      confirmButton = { confirm -> TextButton(onClick = confirm) { Text(stringResource(Res.string.action_delete)) } },
      cancelButton = { cancel -> TextButton(onClick = cancel) { Text(stringResource(Res.string.action_keep)) } },
    ) { (device), confirm -> if (confirm == true) scope.launch { viewModel.delete(device) { viewModel.refresh() } } }

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
        title = { Text(stringResource(Res.string.settings_devices)) },
      )
    },
    floatingActionButton = {
      SimpleTooltip(
        tooltip = { Text(stringResource(Res.string.devices_addDevice)) },
        position = TooltipAnchorPosition.Start,
      ) {
        AnimatedVisibility(visible = showActions.value, enter = fadeIn(), exit = fadeOut()) {
          FloatingActionButton(onClick = { addDevice() }) {
            Icon(painterResource(Res.drawable.plus), contentDescription = stringResource(Res.string.devices_addDevice))
          }
        }
      }
    },
  ) { paddingValues ->
    LazyColumn(modifier = Modifier.padding(paddingValues).fillMaxSize().nestedScroll(connection)) {
      items(state.devices, key = { it.id }) { device ->
        val driver = state.drivers.find { device.driverId == it.id }
        val icon = if (driver?.kind == DriverKind.Monitor) Res.drawable.monitor else Res.drawable.video_switch
        ListItem(
          modifier = Modifier.clickable(enabled = !isLoading) { editDevice(device) },
          leadingContent = { Icon(painterResource(icon), contentDescription = null) },
          headlineContent = { Text(device.title) },
          supportingContent = { Text(driver?.title ?: stringResource(Res.string.unknown_driver)) },
          trailingContent = {
            SimpleTooltip(
              position = TooltipAnchorPosition.Start,
              tooltip = {
                Text(
                  when (driver?.kind) {
                    DriverKind.Monitor -> stringResource(Res.string.devices_deleteMonitor)
                    DriverKind.Switch -> stringResource(Res.string.devices_deleteSwitch)
                    else -> stringResource(Res.string.devices_deleteSwitch)
                  },
                )
              },
            ) {
              IconButton(onClick = { deleteDevice(Pair(device, driver)) }) {
                Icon(
                  painterResource(Res.drawable.delete),
                  contentDescription =
                    when (driver?.kind) {
                      DriverKind.Monitor -> stringResource(Res.string.devices_deleteMonitor)
                      DriverKind.Switch -> stringResource(Res.string.devices_deleteSwitch)
                      else -> stringResource(Res.string.devices_deleteSwitch)
                    },
                )
              }
            }
          },
        )
      }
    }
  }
}
