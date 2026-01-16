@file:OptIn(ExperimentalUuidApi::class)

package org.sleepingcats.bridgecmdr.ui

import androidx.navigation.NavController
import androidx.navigation.NavGraphBuilder
import androidx.navigation.compose.composable
import kotlinx.serialization.Serializable
import org.sleepingcats.bridgecmdr.ui.view.DashboardRoute
import kotlin.uuid.ExperimentalUuidApi

expect fun getStartupRoute(): Route

expect fun NavGraphBuilder.platformRoutes(navController: NavController)

fun NavGraphBuilder.routes(navController: NavController) {
  composable<Dashboard> { DashboardRoute(navController) }
  platformRoutes(navController)
}

interface Route

@Serializable
object Dashboard : Route

@Serializable
object Settings : Route
