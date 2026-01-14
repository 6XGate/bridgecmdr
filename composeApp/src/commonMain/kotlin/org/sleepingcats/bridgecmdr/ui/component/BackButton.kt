package org.sleepingcats.bridgecmdr.ui.component

import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import bridgecmdr.composeapp.generated.resources.Res
import bridgecmdr.composeapp.generated.resources.action_back
import bridgecmdr.composeapp.generated.resources.arrow_left
import org.jetbrains.compose.resources.painterResource
import org.jetbrains.compose.resources.stringResource

@Composable
fun BackButton(
  onClick: () -> Unit,
  modifier: Modifier = Modifier,
) {
  IconButton(onClick, modifier) {
    Icon(painterResource(Res.drawable.arrow_left), contentDescription = stringResource(Res.string.action_back))
  }
}
