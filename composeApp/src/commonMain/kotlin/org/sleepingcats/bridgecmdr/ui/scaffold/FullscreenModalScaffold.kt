@file:OptIn(ExperimentalMaterial3Api::class)

package org.sleepingcats.bridgecmdr.ui.scaffold

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.RowScope
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.material3.contentColorFor
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp

@Composable
fun FullscreenModalScaffold(
  modifier: Modifier = Modifier,
  navigationIcon: @Composable () -> Unit = {},
  titleContent: @Composable () -> Unit,
  actions: @Composable RowScope.() -> Unit = {},
  containerColor: Color = MaterialTheme.colorScheme.surfaceContainerHigh,
  contentColor: Color = MaterialTheme.colorScheme.contentColorFor(containerColor),
  content: @Composable ColumnScope.() -> Unit,
) {
  Scaffold(
    modifier = modifier.fillMaxSize(),
    containerColor = containerColor,
    topBar = {
      TopAppBar(
        colors =
          TopAppBarDefaults.topAppBarColors().copy(
            containerColor = containerColor,
            navigationIconContentColor = contentColor,
            titleContentColor = contentColor,
            actionIconContentColor = contentColor,
          ),
        navigationIcon = navigationIcon,
        title = titleContent,
        actions = actions,
      )
    },
  ) { paddingValues ->
    Column(
      modifier = modifier.padding(paddingValues).padding(horizontal = 24.dp),
      content = content,
    )
  }
}
