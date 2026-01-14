package org.sleepingcats.bridgecmdr.ui.view

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.calculateEndPadding
import androidx.compose.foundation.layout.calculateStartPadding
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.platform.LocalLayoutDirection
import androidx.compose.ui.unit.DpOffset
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.core.content.ContextCompat
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.compose.LifecycleEventEffect
import androidx.navigation.NavController
import com.budiyev.android.codescanner.AutoFocusMode.SAFE
import com.budiyev.android.codescanner.ButtonPosition.TOP_END
import com.budiyev.android.codescanner.ButtonPosition.TOP_START
import com.budiyev.android.codescanner.CodeScanner
import com.budiyev.android.codescanner.CodeScanner.CAMERA_BACK
import com.budiyev.android.codescanner.CodeScannerView
import com.budiyev.android.codescanner.DecodeCallback
import com.budiyev.android.codescanner.ErrorCallback
import com.google.zxing.BarcodeFormat.QR_CODE
import io.github.oshai.kotlinlogging.KLogger
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import org.koin.compose.koinInject
import org.sleepingcats.bridgecmdr.common.ServerCode
import org.sleepingcats.bridgecmdr.common.extension.navigateAndReplaceStartRoute
import org.sleepingcats.bridgecmdr.ui.Dashboard
import org.sleepingcats.bridgecmdr.ui.Route
import org.sleepingcats.bridgecmdr.ui.service.MobileConnectionService

@Composable
fun ScannerRoute(navController: NavController) {
  ScannerView(goTo = { route -> navController.navigateAndReplaceStartRoute(route) })
}

@Composable
private fun ScannerView(
  goTo: (route: Route) -> Unit,
  service: MobileConnectionService = koinInject(),
  context: Context = koinInject(),
  logger: KLogger = koinInject(),
) {
  val launcher =
    rememberLauncherForActivityResult(
      ActivityResultContracts.RequestMultiplePermissions(),
    ) { results ->
      for ((permission, granted) in results) {
        if (!granted) logger.error { "Permission denied: $permission" }
      }
    }

  LaunchedEffect(Unit) {
    when (PackageManager.PERMISSION_GRANTED) {
      ContextCompat.checkSelfPermission(context, Manifest.permission.CAMERA) -> {
        logger.info { "Camera permission granted" }
      }

      ContextCompat.checkSelfPermission(context, Manifest.permission.NEARBY_WIFI_DEVICES) -> {
        logger.info { "Near-by devices permission granted" }
      }

      else -> {
        logger.info { "Requesting camera and near-by devices permissions" }
        launcher.launch(
          arrayOf(
            Manifest.permission.CAMERA,
            Manifest.permission.NEARBY_WIFI_DEVICES,
          ),
        )
      }
    }
  }

  val scope = rememberCoroutineScope()

  var codeScanner: CodeScanner? = null
  LifecycleEventEffect(Lifecycle.Event.ON_PAUSE) {
    codeScanner?.releaseResources()
  }

  LifecycleEventEffect(Lifecycle.Event.ON_RESUME) {
    codeScanner?.startPreview()
  }

  val layoutDirection = LocalLayoutDirection.current
  with(LocalDensity.current) {
    Scaffold { paddingValues ->
      AndroidView(
        modifier = Modifier.fillMaxSize(),
        factory = { ctx ->
          val topStart =
            DpOffset(
              paddingValues.calculateStartPadding(layoutDirection) + 16.dp,
              paddingValues.calculateTopPadding() + 16.dp,
            )

          val topEnd =
            DpOffset(
              paddingValues.calculateEndPadding(layoutDirection) + 16.dp,
              paddingValues.calculateTopPadding() + 16.dp,
            )

          val codeScannerView =
            CodeScannerView(ctx).apply {
              isAutoFocusButtonVisible = true
              autoFocusButtonColor = Color.White.toArgb()
              autoFocusButtonPosition = TOP_START
              autoFocusButtonPaddingHorizontal = topStart.x.toPx().toInt()
              autoFocusButtonPaddingVertical = topStart.y.toPx().toInt()
              isFlashButtonVisible = true
              flashButtonColor = Color.White.toArgb()
              flashButtonPosition = TOP_END
              flashButtonPaddingHorizontal = topEnd.x.toPx().toInt()
              flashButtonPaddingVertical = topEnd.y.toPx().toInt()
              frameColor = Color.White.toArgb()
              frameCornersSize = 75
              frameCornersRadius = 25
              frameAspectRatioWidth = 1f
              frameAspectRatioHeight = 1f
              frameThickness = 5
              frameSize = 0.75f
              frameVerticalBias = 0.5f
              maskColor = Color.Black.copy(alpha = 0.75f).toArgb()
            }

          codeScanner =
            CodeScanner(ctx, codeScannerView).apply {
              camera = CAMERA_BACK
              formats = listOf(QR_CODE)
              autoFocusMode = SAFE

              decodeCallback =
                DecodeCallback { result ->
                  this.releaseResources()
                  service.initialize(ServerCode.fromQrData(result.text))
                  // Sometimes this callback is not called on the main thread.
                  scope.launch(Dispatchers.Main) { goTo(Dashboard) }
                }

              errorCallback =
                ErrorCallback { error ->
                  logger.error(error) { "Scan failed" }
                  // TODO: "Crash" out
                }
            }

          // Start scanning
          codeScanner.startPreview()

          codeScannerView
        },
        onRelease = {
          codeScanner?.releaseResources()
        },
      )
    }
  }
}
