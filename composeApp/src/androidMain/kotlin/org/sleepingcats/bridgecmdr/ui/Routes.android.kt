package org.sleepingcats.bridgecmdr.ui

import androidx.navigation.NavController
import androidx.navigation.NavGraphBuilder
import androidx.navigation.compose.composable
import kotlinx.serialization.Serializable
import org.sleepingcats.bridgecmdr.ui.view.MobileSettingsRoute
import org.sleepingcats.bridgecmdr.ui.view.ScannerRoute

actual fun getStartupRoute(): Route = ScanCode // Dashboard

actual fun NavGraphBuilder.platformRoutes(navController: NavController) {
  composable<ScanCode> { ScannerRoute(navController) }
  composable<Settings> { MobileSettingsRoute(navController) }
}

@Serializable
object ScanCode : Route
