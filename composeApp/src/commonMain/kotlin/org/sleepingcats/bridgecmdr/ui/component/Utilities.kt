package org.sleepingcats.bridgecmdr.ui.component

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.TextFieldDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp

@Composable
fun minHeighBugFixForOutlinedTextField(
  withLabel: Boolean = true,
  withSupportText: Boolean = false,
): Dp =
  with(LocalDensity.current) {
    val smallLineHeight = MaterialTheme.typography.bodySmall.lineHeight
    remember {
      val lineHeight = if (withSupportText) 4.dp + smallLineHeight.toDp() else 0.dp
      val labelPadding = if (withLabel) 8.dp else 0.dp
      OutlinedTextFieldDefaults.MinHeight + labelPadding + lineHeight
    }
  }

@Composable
fun minHeighBugFixForTextField(withSupportText: Boolean = false): Dp =
  with(LocalDensity.current) {
    val smallLineHeight = MaterialTheme.typography.bodySmall.lineHeight
    remember {
      val lineHeight = if (withSupportText) 4.dp + smallLineHeight.toDp() else 0.dp
      TextFieldDefaults.MinHeight + lineHeight
    }
  }
