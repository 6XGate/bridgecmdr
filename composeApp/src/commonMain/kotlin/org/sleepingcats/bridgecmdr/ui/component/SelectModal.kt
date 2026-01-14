package org.sleepingcats.bridgecmdr.ui.component

import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.RowScope
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.selection.selectable
import androidx.compose.foundation.selection.selectableGroup
import androidx.compose.material3.RadioButton
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.key
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.unit.dp
import bridgecmdr.composeapp.generated.resources.Res
import bridgecmdr.composeapp.generated.resources.response_cancel
import org.jetbrains.compose.resources.stringResource

internal object SelectModalDefault {
  @Composable
  fun defaultCancelContent(onClick: () -> Unit) {
    TextButton(onClick = onClick) { Text(stringResource(Res.string.response_cancel)) }
  }
}

@Composable
fun <T> SelectModal(
  itemContent: @Composable (T) -> String,
  items: List<T>,
  cancelContent: @Composable (RowScope.(() -> Unit) -> Unit) = { SelectModalDefault.defaultCancelContent(it) },
  headlineContent: @Composable (RowScope.() -> Unit)? = null,
  supportContent: @Composable (RowScope.() -> Unit)? = null,
  onDismiss: (T?) -> Unit,
): (T?) -> Unit {
  val (current, setCurrent) = remember { mutableStateOf<T?>(null) }
  val showModal =
    PopupModal<T>(
      onDismiss = onDismiss,
      headlineContent = headlineContent,
      actions = { dismiss -> cancelContent { dismiss(null) } },
    ) { dismiss ->
      Column(modifier = Modifier.selectableGroup()) {
        supportContent?.let { Row(modifier = Modifier.padding(bottom = 16.dp)) { it() } }
        for (item in items) {
          key(item) {
            Row(modifier = Modifier.fillMaxWidth().height(45.dp), verticalAlignment = Alignment.CenterVertically) {
              val interactionSource = remember { MutableInteractionSource() }
              RadioButton(
                selected = item == current,
                onClick = { dismiss(item) },
                interactionSource = interactionSource,
              )
              Text(
                text = itemContent(item),
                modifier =
                  Modifier
                    // .padding(start = 8.dp)
                    .selectable(
                      selected = current == item,
                      onClick = { dismiss(item) },
                      interactionSource = interactionSource,
                      indication = null,
                      role = Role.RadioButton,
                    ),
              )
            }
          }
        }
      }
    }

  return { value ->
    setCurrent(value)
    showModal()
  }
}
