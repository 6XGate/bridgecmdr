@file:OptIn(ExperimentalMaterial3Api::class)

package org.sleepingcats.bridgecmdr.ui.component

import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.PlainTooltip
import androidx.compose.material3.TooltipAnchorPosition
import androidx.compose.material3.TooltipBox
import androidx.compose.material3.TooltipDefaults
import androidx.compose.material3.TooltipState
import androidx.compose.material3.rememberTooltipState
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier

@Composable
fun SimpleTooltip(
  tooltip: @Composable () -> Unit,
  modifier: Modifier = Modifier,
  position: TooltipAnchorPosition = TooltipAnchorPosition.Below,
  state: TooltipState = rememberTooltipState(),
  content: @Composable () -> Unit,
) {
  TooltipBox(
    positionProvider = TooltipDefaults.rememberTooltipPositionProvider(positioning = position),
    modifier = modifier,
    state = state,
    tooltip = { PlainTooltip(content = tooltip) },
    content = content,
  )
}
