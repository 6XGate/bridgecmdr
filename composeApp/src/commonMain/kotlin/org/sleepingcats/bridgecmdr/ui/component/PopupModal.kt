package org.sleepingcats.bridgecmdr.ui.component

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.RowScope
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Card
import androidx.compose.material3.LocalTextStyle
import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Alignment.Companion.CenterHorizontally
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties

@Composable
fun <T> PopupModal(
  visible: Boolean,
  modifier: Modifier = Modifier,
  properties: DialogProperties = DialogProperties(),
  onDismiss: (T?) -> Unit,
  headlineContent: @Composable (RowScope.() -> Unit)? = null,
  actions: @Composable (RowScope.((T?) -> Unit) -> Unit)? = null,
  content: @Composable ColumnScope.((T?) -> Unit) -> Unit,
) {
  AnimatedVisibility(visible) {
    Dialog(properties = properties, onDismissRequest = { onDismiss(null) }) {
      Card(modifier = Modifier.animateEnterExit()) {
        Column(modifier = modifier.padding(24.dp)) {
          headlineContent?.let {
            CompositionLocalProvider(LocalTextStyle provides MaterialTheme.typography.headlineSmall) {
              Row(modifier = Modifier.padding(bottom = 16.dp).align(CenterHorizontally)) { this.it() }
            }
          }
          CompositionLocalProvider(LocalTextStyle provides MaterialTheme.typography.bodyMedium) {
            this.content(onDismiss)
          }
          actions?.let { Row(modifier = Modifier.align(Alignment.End).padding(top = 24.dp)) { this.it(onDismiss) } }
        }
      }
    }
  }
}

@Composable
fun <T> PopupModal(
  modifier: Modifier = Modifier,
  properties: DialogProperties = DialogProperties(),
  onDismiss: (T?) -> Unit,
  headlineContent: @Composable (RowScope.() -> Unit)? = null,
  actions: @Composable (RowScope.((T?) -> Unit) -> Unit)? = null,
  content: @Composable ColumnScope.((T?) -> Unit) -> Unit,
): () -> Unit {
  val (visible, setVisible) = remember { mutableStateOf(false) }

  val dismiss: (T?) -> Unit = { value ->
    setVisible(false)
    onDismiss(value)
  }

  PopupModal(
    visible = visible,
    modifier = modifier,
    properties = properties,
    onDismiss = dismiss,
    headlineContent = headlineContent,
    actions = actions,
    content = content,
  )

  return { setVisible(true) }
}
