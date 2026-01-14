package org.sleepingcats.bridgecmdr.common.setting

import bridgecmdr.composeapp.generated.resources.Res
import bridgecmdr.composeapp.generated.resources.setting_AppTheme_Dark
import bridgecmdr.composeapp.generated.resources.setting_AppTheme_Dark_option
import bridgecmdr.composeapp.generated.resources.setting_AppTheme_Light
import bridgecmdr.composeapp.generated.resources.setting_AppTheme_Light_option
import bridgecmdr.composeapp.generated.resources.setting_AppTheme_System
import bridgecmdr.composeapp.generated.resources.setting_AppTheme_System_option
import org.jetbrains.compose.resources.StringResource

enum class AppTheme(
  val option: StringResource,
  val description: StringResource,
) {
  System(Res.string.setting_AppTheme_System_option, Res.string.setting_AppTheme_System),
  Light(Res.string.setting_AppTheme_Light_option, Res.string.setting_AppTheme_Light),
  Dark(Res.string.setting_AppTheme_Dark_option, Res.string.setting_AppTheme_Dark),
}
