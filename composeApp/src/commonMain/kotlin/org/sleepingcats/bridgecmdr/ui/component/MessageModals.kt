@file:OptIn(ExperimentalContracts::class, ExperimentalExtendedContracts::class)

package org.sleepingcats.bridgecmdr.ui.component

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.AlertDialogDefaults
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Shape
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.window.DialogProperties
import bridgecmdr.composeapp.generated.resources.Res
import bridgecmdr.composeapp.generated.resources.response_no
import bridgecmdr.composeapp.generated.resources.response_understood
import bridgecmdr.composeapp.generated.resources.response_yes
import org.jetbrains.compose.resources.stringResource
import kotlin.contracts.ExperimentalContracts
import kotlin.contracts.ExperimentalExtendedContracts

@Composable
fun defaultCloseButton(close: () -> Unit) {
  TextButton(onClick = close) { Text(stringResource(Res.string.response_understood)) }
}

@Composable
fun AlertModal(
  visible: Boolean,
  onClose: () -> Unit,
  modifier: Modifier = Modifier,
  icon: @Composable (() -> Unit)? = null,
  title: @Composable () -> Unit,
  text: @Composable (() -> Unit)? = null,
  closeButton: @Composable (() -> Unit) -> Unit = ::defaultCloseButton,
  shape: Shape = AlertDialogDefaults.shape,
  containerColor: Color = AlertDialogDefaults.containerColor,
  iconContentColor: Color = AlertDialogDefaults.iconContentColor,
  titleContentColor: Color = AlertDialogDefaults.titleContentColor,
  textContentColor: Color = AlertDialogDefaults.textContentColor,
  tonalElevation: Dp = AlertDialogDefaults.TonalElevation,
  properties: DialogProperties = DialogProperties(),
) {
  AnimatedVisibility(visible) {
    AlertDialog(
      onDismissRequest = onClose,
      confirmButton = { closeButton(onClose) },
      modifier = modifier.animateEnterExit(),
      icon = icon,
      title = title,
      text = text,
      shape = shape,
      containerColor = containerColor,
      iconContentColor = iconContentColor,
      titleContentColor = titleContentColor,
      textContentColor = textContentColor,
      tonalElevation = tonalElevation,
      properties = properties,
    )
  }
}

@Composable
fun defaultConfirmButton(confirm: () -> Unit) {
  TextButton(onClick = confirm) { Text(stringResource(Res.string.response_yes)) }
}

@Composable
fun defaultCancelButton(cancel: () -> Unit) {
  TextButton(onClick = cancel) { Text(stringResource(Res.string.response_no)) }
}

@Composable
fun ConfirmModal(
  visible: Boolean,
  onResponse: (Boolean?) -> Unit,
  modifier: Modifier = Modifier,
  icon: @Composable (() -> Unit)? = null,
  title: @Composable () -> Unit,
  text: @Composable (() -> Unit)? = null,
  confirmButton: @Composable (() -> Unit) -> Unit = ::defaultConfirmButton,
  cancelButton: @Composable (() -> Unit) -> Unit = ::defaultCancelButton,
  containerColor: Color = AlertDialogDefaults.containerColor,
  iconContentColor: Color = AlertDialogDefaults.iconContentColor,
  titleContentColor: Color = AlertDialogDefaults.titleContentColor,
  textContentColor: Color = AlertDialogDefaults.textContentColor,
  tonalElevation: Dp = AlertDialogDefaults.TonalElevation,
  properties: DialogProperties = DialogProperties(),
) {
  AnimatedVisibility(visible) {
    AlertDialog(
      onDismissRequest = { onResponse(null) },
      confirmButton = { confirmButton { onResponse(true) } },
      dismissButton = { cancelButton { onResponse(false) } },
      modifier = modifier.animateEnterExit(),
      icon = icon,
      title = title,
      text = text,
      containerColor = containerColor,
      iconContentColor = iconContentColor,
      titleContentColor = titleContentColor,
      textContentColor = textContentColor,
      tonalElevation = tonalElevation,
      properties = properties,
    )
  }
}

@Composable
fun <T> ConfirmModal(
  modifier: Modifier = Modifier,
  icon: @Composable ((T) -> Unit)? = null,
  title: @Composable (T) -> Unit,
  text: @Composable ((T) -> Unit)? = null,
  confirmButton: @Composable (() -> Unit) -> Unit = ::defaultConfirmButton,
  cancelButton: @Composable (() -> Unit) -> Unit = ::defaultCancelButton,
  containerColor: Color = AlertDialogDefaults.containerColor,
  iconContentColor: Color = AlertDialogDefaults.iconContentColor,
  titleContentColor: Color = AlertDialogDefaults.titleContentColor,
  textContentColor: Color = AlertDialogDefaults.textContentColor,
  tonalElevation: Dp = AlertDialogDefaults.TonalElevation,
  properties: DialogProperties = DialogProperties(),
  onResponded: (T, Boolean?) -> Unit,
): (T) -> Unit {
  val (visible, setVisible) = remember { mutableStateOf(false) }
  var input by remember { mutableStateOf<T?>(null) }

  val dismiss: (Boolean?) -> Unit = { value ->
    setVisible(false)
    onResponded(checkNotNull(input), value)
  }

  ConfirmModal(
    visible = visible,
    onResponse = dismiss,
    modifier = modifier,
    icon = icon?.let { icon -> { icon(checkNotNull(input)) } },
    title = { title(checkNotNull(input)) },
    text = text?.let { text -> { text(checkNotNull(input)) } },
    confirmButton = confirmButton,
    cancelButton = cancelButton,
    containerColor = containerColor,
    iconContentColor = iconContentColor,
    titleContentColor = titleContentColor,
    textContentColor = textContentColor,
    tonalElevation = tonalElevation,
    properties = properties,
  )

  return {
    input = it
    setVisible(true)
  }
}

@Composable
fun ConfirmModal(
  modifier: Modifier = Modifier,
  icon: @Composable (() -> Unit)? = null,
  title: @Composable () -> Unit,
  text: @Composable (() -> Unit)? = null,
  confirmButton: @Composable (() -> Unit) -> Unit = ::defaultConfirmButton,
  cancelButton: @Composable (() -> Unit) -> Unit = ::defaultCancelButton,
  containerColor: Color = AlertDialogDefaults.containerColor,
  iconContentColor: Color = AlertDialogDefaults.iconContentColor,
  titleContentColor: Color = AlertDialogDefaults.titleContentColor,
  textContentColor: Color = AlertDialogDefaults.textContentColor,
  tonalElevation: Dp = AlertDialogDefaults.TonalElevation,
  properties: DialogProperties = DialogProperties(),
  onResponded: (Boolean?) -> Unit,
): () -> Unit {
  val (visible, setVisible) = remember { mutableStateOf(false) }

  val dismiss: (Boolean?) -> Unit =
    remember {
      { value ->
        setVisible(false)
        onResponded(value)
      }
    }

  ConfirmModal(
    visible = visible,
    onResponse = dismiss,
    modifier = modifier,
    icon = icon,
    title = title,
    text = text,
    confirmButton = confirmButton,
    cancelButton = cancelButton,
    containerColor = containerColor,
    iconContentColor = iconContentColor,
    titleContentColor = titleContentColor,
    textContentColor = textContentColor,
    tonalElevation = tonalElevation,
    properties = properties,
  )

  return { setVisible(true) }
}

/*

fun confirmAction(...)
fun <A1> confirmAction(...)
fun <A1, A2> confirmAction(...)
fun <A1, A2, A3> confirmAction(...)

val onDelete = confirmAction<Device, Driver> { device, driver ->
  title = { Text("Delete device ${device.title}?") },
  text = { Text("Are you sure you want to delete this device? This action cannot be undone.") },
  confirmButton = { confirm -> TextButton(onClick = confirm) { Text("Delete") } },
}

onDelete(device, driver) { confirmed ->
  if (confirmed == true) {
    viewModel.deleteDevice(device)
  }
}

*/
