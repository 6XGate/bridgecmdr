package org.sleepingcats.bridgecmdr.ui.platform

import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import io.github.oshai.kotlinlogging.KLogger
import org.koin.androidx.compose.koinViewModel
import org.koin.compose.koinInject
import org.sleepingcats.bridgecmdr.ui.Route
import org.sleepingcats.bridgecmdr.ui.ScanCode
import org.sleepingcats.bridgecmdr.ui.view.model.DashboardViewModel
import org.sleepingcats.bridgecmdr.ui.view.model.MobileDashboardViewModel

@Composable
actual fun ColumnScope.PlatformDashboardActions(
  goTo: (route: Route) -> Unit,
  startOver: (route: Route) -> Unit,
) {
  val logger: KLogger = koinInject()
  val dashboardViewModel = koinViewModel<DashboardViewModel>() as MobileDashboardViewModel

  val connected by dashboardViewModel.connected.collectAsState(false)
  LaunchedEffect(connected) {
    if (!connected) {
      logger.warn { "Connection lost, returning to scanner." }
      // If the connection is lost, go to the scanner.
      startOver(ScanCode)
    }
  }
}
