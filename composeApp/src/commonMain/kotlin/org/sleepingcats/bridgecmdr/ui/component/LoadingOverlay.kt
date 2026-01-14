package org.sleepingcats.bridgecmdr.ui.component

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.AnimatedVisibilityScope
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.size
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment.Companion.Center
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.Popup
import androidx.compose.ui.window.PopupProperties
import androidx.compose.ui.zIndex

@Composable
fun AnimatedVisibilityScope.defaultLoadingModalContent() {
  Box(
    contentAlignment = Center,
    modifier =
      Modifier
        .animateEnterExit(enter = fadeIn(), exit = fadeOut())
        .background(color = MaterialTheme.colorScheme.scrim.copy(alpha = 0.5f))
        .fillMaxSize()
        .zIndex(100f),
  ) {
    CircularProgressIndicator(modifier = Modifier.size(64.dp))
  }
}

@Composable
fun LoadingOverlay(
  isLoading: Boolean,
  content: @Composable AnimatedVisibilityScope.() -> Unit = AnimatedVisibilityScope::defaultLoadingModalContent,
) {
  val properties =
    remember {
      PopupProperties(
        focusable = false,
        dismissOnBackPress = false,
        dismissOnClickOutside = false,
        clippingEnabled = false,
      )
    }

  AnimatedVisibility(isLoading) {
    Popup(onDismissRequest = { }, properties = properties) {
      content()
    }
  }
}
