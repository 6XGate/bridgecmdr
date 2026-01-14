@file:OptIn(ExperimentalUuidApi::class, ExperimentalMaterial3Api::class)

package org.sleepingcats.bridgecmdr.ui.view

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.lazy.grid.rememberLazyGridState
import androidx.compose.foundation.selection.selectable
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TooltipAnchorPosition
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment.Companion.End
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.dropShadow
import androidx.compose.ui.unit.DpSize
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.navigation.NavController
import bridgecmdr.composeapp.generated.resources.Res
import bridgecmdr.composeapp.generated.resources.cog
import bridgecmdr.composeapp.generated.resources.settings
import org.jetbrains.compose.resources.painterResource
import org.jetbrains.compose.resources.stringResource
import org.koin.compose.viewmodel.koinViewModel
import org.sleepingcats.bridgecmdr.common.extension.navigateAndReplaceStartRoute
import org.sleepingcats.bridgecmdr.common.service.model.Source
import org.sleepingcats.bridgecmdr.ui.Route
import org.sleepingcats.bridgecmdr.ui.Settings
import org.sleepingcats.bridgecmdr.ui.component.LoadingOverlay
import org.sleepingcats.bridgecmdr.ui.component.MediaImage
import org.sleepingcats.bridgecmdr.ui.component.SimpleTooltip
import org.sleepingcats.bridgecmdr.ui.platform.PlatformDashboardActions
import org.sleepingcats.bridgecmdr.ui.view.model.DashboardViewModel
import sh.calvin.reorderable.ReorderableItem
import sh.calvin.reorderable.rememberReorderableLazyGridState
import kotlin.uuid.ExperimentalUuidApi

@Composable
fun DashboardRoute(navController: NavController) {
  DashboardView(
    goTo = { r -> navController.navigate(r) },
    startOver = { r -> navController.navigateAndReplaceStartRoute(r) },
  )
}

@Composable
private fun DashboardView(
  goTo: (Route) -> Unit,
  startOver: (Route) -> Unit,
  viewModel: DashboardViewModel = koinViewModel(),
) {
  val state by viewModel.state.collectAsStateWithLifecycle()
  val buttonSize = DpSize(state.iconSize.size.dp, state.iconSize.size.dp)

  val normalContainerColor = MaterialTheme.colorScheme.surfaceContainer
  val activatedContainerColor = MaterialTheme.colorScheme.primaryContainer

  val lazyGridState = rememberLazyGridState()
  val reorderState =
    rememberReorderableLazyGridState(lazyGridState) { from, to ->
      viewModel.moveButton(from.index, to.index)
    }

  fun activateSource(source: Source) = viewModel.activateSource(source)

  LoadingOverlay(state.isLoading)

  Scaffold(
    modifier = Modifier.fillMaxSize(),
    floatingActionButton = {
      Column(horizontalAlignment = End) {
        SimpleTooltip(
          position = TooltipAnchorPosition.Start,
          tooltip = { Text(stringResource(Res.string.settings)) },
        ) {
          FloatingActionButton(
            modifier = Modifier.padding(top = 16.dp),
            onClick = { goTo(Settings) },
          ) { Icon(painterResource(Res.drawable.cog), contentDescription = stringResource(Res.string.settings)) }
        }
        PlatformDashboardActions(goTo, startOver)
      }
    },
  ) { paddingValues ->
    LazyVerticalGrid(
      state = lazyGridState,
      modifier = Modifier.fillMaxSize().padding(paddingValues),
      columns = GridCells.FixedSize(buttonSize.width + 20.dp),
    ) {
      items(state.sources, key = { it.id }) { source ->
        ReorderableItem(reorderState, key = source.id) { isDragging ->
          Box(
            modifier =
              Modifier
                .padding(start = 16.dp, top = 16.dp)
                .draggableHandle()
                .dropShadow(MaterialTheme.shapes.medium) {
                  if (isDragging) {
                    alpha = 0.5f
                    radius = 4f
                    spread = 4f
                  } else {
                    alpha = 0f
                  }
                }.clip(MaterialTheme.shapes.medium)
                .alpha(if (state.dragged?.id == source.id) 0.25f else 1f)
                .background(if (source.id == state.active?.id) activatedContainerColor else normalContainerColor)
                .selectable(selected = source.id == state.active?.id, onClick = { activateSource(source) })
                .padding(4.dp)
                .size(buttonSize),
          ) {
            MediaImage(
              source.image,
              contentDescription = source.title,
              containerColor = if (source.id == state.active?.id) activatedContainerColor else normalContainerColor,
              size = buttonSize,
            )
          }
        }
      }
    }
  }
}
