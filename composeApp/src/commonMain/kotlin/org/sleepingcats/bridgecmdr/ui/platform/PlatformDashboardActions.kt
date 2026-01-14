package org.sleepingcats.bridgecmdr.ui.platform

import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.runtime.Composable
import org.sleepingcats.bridgecmdr.ui.Route

@Composable
expect fun ColumnScope.PlatformDashboardActions(
  goTo: (route: Route) -> Unit,
  startOver: (route: Route) -> Unit,
)
