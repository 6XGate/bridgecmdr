package org.sleepingcats.bridgecmdr.ui.component

import androidx.compose.runtime.Composable
import androidx.compose.runtime.MutableState
import androidx.compose.runtime.remember
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.input.nestedscroll.NestedScrollConnection
import androidx.compose.ui.input.nestedscroll.NestedScrollSource

@Composable
fun hideOnScroll(visibilityState: MutableState<Boolean>): NestedScrollConnection {
  // val (showActions, setShowActions) = rememberSaveable { mutableStateOf(true) }
  return remember {
    object : NestedScrollConnection {
      override fun onPreScroll(
        available: Offset,
        source: NestedScrollSource,
      ): Offset {
        if (available.y < -1) {
          visibilityState.value = false
        } else if (available.y > 1) {
          visibilityState.value = true
        }
        return Offset.Zero
      }
    }
  }
}
