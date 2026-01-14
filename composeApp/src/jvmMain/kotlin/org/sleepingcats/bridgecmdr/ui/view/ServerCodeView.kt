@file:OptIn(ExperimentalMaterial3Api::class)

package org.sleepingcats.bridgecmdr.ui.view

import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment.Companion.Center
import androidx.compose.ui.Alignment.Companion.CenterHorizontally
import androidx.compose.ui.Modifier
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import bridgecmdr.composeapp.generated.resources.Res
import bridgecmdr.composeapp.generated.resources.branding_appName
import bridgecmdr.composeapp.generated.resources.server_remoteCode
import bridgecmdr.composeapp.generated.resources.server_remoteCode_instructions
import org.jetbrains.compose.resources.stringResource
import org.koin.compose.koinInject
import org.sleepingcats.bridgecmdr.ui.component.BackButton
import org.sleepingcats.bridgecmdr.ui.view.model.ServerCodeViewModel

@Composable
fun ServerCodeRoute(navController: NavController) {
  ServerCodeView(goBack = { navController.popBackStack() })
}

@Composable
private fun ServerCodeView(
  goBack: () -> Unit,
  viewModel: ServerCodeViewModel = koinInject(),
) {
  val state by viewModel.state.collectAsState()

  Scaffold(
    topBar = {
      TopAppBar(
        navigationIcon = { BackButton(goBack) },
        title = { Text(stringResource(Res.string.server_remoteCode)) },
      )
    },
  ) { paddingValues ->
    Box(modifier = Modifier.padding(paddingValues).fillMaxSize(), contentAlignment = Center) {
      Column(horizontalAlignment = CenterHorizontally) {
        state.qrCode?.let { bitmap -> Image(bitmap, contentDescription = null, contentScale = ContentScale.None) }
        Text(
          stringResource(Res.string.server_remoteCode_instructions, stringResource(Res.string.branding_appName)),
          modifier = Modifier.padding(top = 8.dp),
          textAlign = TextAlign.Center,
        )
      }
    }
  }
}
