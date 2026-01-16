package org.sleepingcats.bridgecmdr

import android.content.res.Configuration
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.core.view.WindowCompat
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.repeatOnLifecycle
import kotlinx.coroutines.launch
import org.koin.android.ext.android.inject
import org.sleepingcats.bridgecmdr.common.setting.AppTheme
import org.sleepingcats.bridgecmdr.ui.view.model.ApplicationViewModel

class MainActivity : ComponentActivity() {
  private val viewModel: ApplicationViewModel by inject()

  override fun onCreate(savedInstanceState: Bundle?) {
    enableEdgeToEdge()
    super.onCreate(savedInstanceState)

    lifecycleScope.launch {
      repeatOnLifecycle(Lifecycle.State.STARTED) {
        viewModel.state.collect { state ->
          val appTheme = state.appTheme
          val darkMode =
            when (appTheme) {
              AppTheme.Light -> {
                true
              }

              AppTheme.Dark -> {
                false
              }

              AppTheme.System -> {
                when (resources.configuration.uiMode) {
                  Configuration.UI_MODE_NIGHT_YES -> true
                  Configuration.UI_MODE_NIGHT_NO -> false
                  else -> false
                }
              }
            }

          WindowCompat
            .getInsetsController(window, window.decorView)
            .isAppearanceLightStatusBars = darkMode
        }
      }
    }

    setContent {
      App()
    }
  }
}

// @Preview
// @Composable
// fun AppAndroidPreview() {
//   App()
// }
