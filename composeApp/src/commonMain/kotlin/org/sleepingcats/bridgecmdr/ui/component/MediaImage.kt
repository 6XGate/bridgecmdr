@file:OptIn(ExperimentalUuidApi::class)

package org.sleepingcats.bridgecmdr.ui.component

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.size
import androidx.compose.material3.Icon
import androidx.compose.material3.LocalContentColor
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.contentColorFor
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.FilterQuality
import androidx.compose.ui.unit.DpSize
import androidx.compose.ui.unit.dp
import bridgecmdr.composeapp.generated.resources.Res
import bridgecmdr.composeapp.generated.resources.nintendo_game_boy
import coil3.ImageLoader
import coil3.compose.AsyncImage
import org.jetbrains.compose.resources.painterResource
import org.koin.compose.koinInject
import kotlin.uuid.ExperimentalUuidApi
import kotlin.uuid.Uuid

@Composable
fun MediaImage(
  data: Uuid?,
  contentDescription: String?,
  modifier: Modifier = Modifier,
  size: DpSize = DpSize(56.dp, 56.dp),
  imageLoader: ImageLoader = koinInject(),
  containerColor: Color = MaterialTheme.colorScheme.surfaceContainer,
  contentColor: Color = MaterialTheme.colorScheme.contentColorFor(containerColor),
) {
  CompositionLocalProvider(LocalContentColor provides contentColor) {
    if (data != null) {
      AsyncImage(
        model = data,
        imageLoader = imageLoader,
        contentDescription = contentDescription,
        filterQuality = FilterQuality.High,
        modifier =
          modifier
            .size(size)
            .clip(MaterialTheme.shapes.medium)
            .background(containerColor),
      )
    } else {
      Icon(
        painterResource(Res.drawable.nintendo_game_boy),
        contentDescription = contentDescription,
        modifier =
          modifier
            .size(size)
            .clip(MaterialTheme.shapes.medium)
            .background(containerColor),
      )
    }
  }
}
