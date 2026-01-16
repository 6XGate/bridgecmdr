package org.sleepingcats.bridgecmdr.common.extension

import androidx.navigation.NavController
import org.sleepingcats.bridgecmdr.ui.Route

fun NavController.navigateAndReplaceStartRoute(route: Route) {
  popBackStack(graph.startDestinationId, true)
  graph.setStartDestination(route)
  navigate(route)
}
