package org.sleepingcats.bridgecmdr.ui.component

import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.RowScope
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TextField
import androidx.compose.runtime.Composable
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import bridgecmdr.composeapp.generated.resources.Res
import bridgecmdr.composeapp.generated.resources.response_cancel
import bridgecmdr.composeapp.generated.resources.response_confirm
import org.jetbrains.compose.resources.stringResource

internal object InputModalDefault {
  @Composable
  fun defaultConfirmContent(onClick: () -> Unit) {
    TextButton(onClick = onClick) { Text(stringResource(Res.string.response_confirm)) }
  }

  @Composable
  fun defaultCancelContent(onClick: () -> Unit) {
    TextButton(onClick = onClick) { Text(stringResource(Res.string.response_cancel)) }
  }
}

@Composable
fun InputModal(
  confirmContent: @Composable (RowScope.(() -> Unit) -> Unit) = { InputModalDefault.defaultConfirmContent(it) },
  cancelContent: @Composable (RowScope.(() -> Unit) -> Unit) = { InputModalDefault.defaultCancelContent(it) },
  headlineContent: @Composable (RowScope.() -> Unit)? = null,
  label: @Composable (() -> Unit)? = null,
  onDismiss: (String?) -> Unit,
): (String?) -> Unit {
  val (current, setCurrent) = remember { mutableStateOf<String?>(null) }
  val showModal =
    PopupModal(
      onDismiss = onDismiss,
      headlineContent = headlineContent,
      actions = { dismiss ->
        cancelContent { dismiss(null) }
        confirmContent { dismiss(current) }
      },
    ) {
      // Bugfix for layout issue with OutlinedTextField and minLines/maxLines/singleLine
      val minHeight = minHeighBugFixForTextField()

      Row(modifier = Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
        TextField(
          label = label,
          value = current ?: "",
          onValueChange = { setCurrent(it) },
          modifier = Modifier.fillMaxWidth().height(minHeight),
          singleLine = true,
        )
      }
    }

  return { newValue ->
    setCurrent(newValue)
    showModal()
  }
}
