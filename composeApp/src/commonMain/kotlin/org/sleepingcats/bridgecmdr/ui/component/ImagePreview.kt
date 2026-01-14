@file:OptIn(ExperimentalUuidApi::class)

package org.sleepingcats.bridgecmdr.ui.component

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.animateDpAsState
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.hoverable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.collectIsHoveredAsState
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxScope
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.material3.Icon
import androidx.compose.material3.LocalContentColor
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.contentColorFor
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment.Companion.Center
import androidx.compose.ui.Alignment.Companion.CenterHorizontally
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.blur
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.FilterQuality
import androidx.compose.ui.unit.DpSize
import androidx.compose.ui.unit.dp
import bridgecmdr.composeapp.generated.resources.Res
import bridgecmdr.composeapp.generated.resources.image_chooseImage
import bridgecmdr.composeapp.generated.resources.image_plus
import bridgecmdr.composeapp.generated.resources.nintendo_game_boy
import coil3.ImageLoader
import coil3.compose.AsyncImage
import org.jetbrains.compose.resources.painterResource
import org.jetbrains.compose.resources.stringResource
import org.koin.compose.koinInject
import kotlin.uuid.ExperimentalUuidApi
import kotlin.uuid.Uuid

@Composable
fun ImagePreview(
  model: Uuid?,
  onClick: () -> Unit,
  modifier: Modifier = Modifier,
  size: DpSize = DpSize(128.dp, 128.dp),
  imageLoader: ImageLoader = koinInject(),
  containerColor: Color = MaterialTheme.colorScheme.surfaceContainer,
  contentColor: Color = MaterialTheme.colorScheme.contentColorFor(containerColor),
  hoverContainerColor: Color = MaterialTheme.colorScheme.surface,
  hoverContentColor: Color = contentColorFor(hoverContainerColor),
  hoverContent: (@Composable BoxScope.() -> Unit)? = null,
) {
  val interactionSource = remember { MutableInteractionSource() }
  val isHovering by interactionSource.collectIsHoveredAsState()
  val blurring by animateDpAsState(if (isHovering) 4.dp else 0.dp)

  Box(modifier = modifier.size(size).clip(MaterialTheme.shapes.medium).background(containerColor)) {
    CompositionLocalProvider(LocalContentColor provides contentColor) {
      if (model != null) {
        CompositionLocalProvider(LocalContentColor provides Color.Unspecified) {
          AsyncImage(
            model = model,
            imageLoader = imageLoader,
            contentDescription = null,
            filterQuality = FilterQuality.High,
            modifier =
              Modifier
                .fillMaxSize()
                .clickable(onClick = onClick)
                .hoverable(interactionSource)
                .blur(blurring),
          )
        }
      } else {
        Icon(
          painterResource(Res.drawable.nintendo_game_boy),
          contentDescription = null,
          modifier =
            Modifier
              .fillMaxSize()
              .clickable(onClick = onClick)
              .hoverable(interactionSource)
              .blur(blurring),
        )
      }
    }

    AnimatedVisibility(isHovering, enter = fadeIn(), exit = fadeOut()) {
      val iconSize = size.width.coerceAtMost(size.height) / 2
      CompositionLocalProvider(LocalContentColor provides hoverContentColor) {
        Box(
          modifier =
            Modifier
              .animateEnterExit(enter = fadeIn(), exit = fadeOut())
              .fillMaxSize()
              .background(hoverContainerColor.copy(alpha = 0.8f)),
        ) {
          hoverContent?.invoke(this) ?: Column(modifier = Modifier.align(Center)) {
            Icon(
              painterResource(Res.drawable.image_plus),
              modifier = Modifier.size(iconSize).padding(bottom = 4.dp).align(CenterHorizontally),
              contentDescription = null,
            )
            Text(stringResource(Res.string.image_chooseImage), style = MaterialTheme.typography.labelMedium)
          }
        }
      }
    }
  }
}
