package org.sleepingcats.bridgecmdr.ui

import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.slideInVertically
import androidx.compose.animation.slideOutVertically
import androidx.compose.runtime.remember
import androidx.navigation.NavController
import androidx.navigation.NavGraphBuilder
import androidx.navigation.compose.composable
import androidx.navigation.navigation
import androidx.navigation.toRoute
import kotlinx.serialization.Serializable
import org.sleepingcats.bridgecmdr.ui.view.BackupManagerRoute
import org.sleepingcats.bridgecmdr.ui.view.DeviceListRoute
import org.sleepingcats.bridgecmdr.ui.view.EditDeviceRoute
import org.sleepingcats.bridgecmdr.ui.view.EditSourceRoute
import org.sleepingcats.bridgecmdr.ui.view.EditTieRoute
import org.sleepingcats.bridgecmdr.ui.view.GeneralSettingsRoute
import org.sleepingcats.bridgecmdr.ui.view.ServerCodeRoute
import org.sleepingcats.bridgecmdr.ui.view.SettingsRoute
import org.sleepingcats.bridgecmdr.ui.view.SourceListRoute
import org.sleepingcats.bridgecmdr.ui.view.TieListRoute

actual fun getStartupRoute(): Route = Dashboard

actual fun NavGraphBuilder.platformRoutes(navController: NavController) {
  navigation<Settings> (startDestination = MainSettings) {
    composable<MainSettings> { SettingsRoute(navController) }
    composable<ServerCode> { ServerCodeRoute(navController) }
    composable<GeneralSettings> { GeneralSettingsRoute(navController) }
    composable<SourceList> { SourceListRoute(navController) }
    composable<EditSource>(
      enterTransition = { slideInVertically(initialOffsetY = { it }) + fadeIn() },
      exitTransition = { slideOutVertically(targetOffsetY = { it }) + fadeOut() },
    ) { EditSourceRoute(navController, it.toRoute()) }
    composable<DeviceList> { DeviceListRoute(navController) }
    composable<EditDevice>(
      enterTransition = { slideInVertically(initialOffsetY = { it }) + fadeIn() },
      exitTransition = { slideOutVertically(targetOffsetY = { it }) + fadeOut() },
    ) { EditDeviceRoute(navController, it.toRoute()) }
    navigation<Ties>(startDestination = TieList) {
      composable<TieList> {
        val parent: Ties = remember(it) { navController.getBackStackEntry<Ties>().toRoute() }
        TieListRoute(navController, parent)
      }
      composable<EditTie>(
        enterTransition = { slideInVertically(initialOffsetY = { it }) + fadeIn() },
        exitTransition = { slideOutVertically(targetOffsetY = { it }) + fadeOut() },
      ) {
        val parent: Ties = remember(it) { navController.getBackStackEntry<Ties>().toRoute() }
        EditTieRoute(navController, parent, it.toRoute())
      }
    }
    composable<BackupManager> { BackupManagerRoute(navController = navController) }
  }
}

@Serializable
object ServerCode : Route

@Serializable
object MainSettings : Route

@Serializable
object GeneralSettings : Route

@Serializable
object DeviceList : Route

@Serializable
class EditDevice(
  val deviceId: String?,
) : Route

@Serializable
object SourceList : Route

@Serializable
class EditSource(
  val sourceId: String?,
) : Route

@Serializable
class Ties(
  val sourceId: String,
) : Route

@Serializable
object TieList : Route

@Serializable
class EditTie(
  val tieId: String?,
) : Route

@Serializable
object BackupManager : Route
