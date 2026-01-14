package org.sleepingcats.bridgecmdr.common.setting

import bridgecmdr.composeapp.generated.resources.Res
import bridgecmdr.composeapp.generated.resources.setting_PowerOffTaps_Double
import bridgecmdr.composeapp.generated.resources.setting_PowerOffTaps_Double_option
import bridgecmdr.composeapp.generated.resources.setting_PowerOffTaps_Single
import bridgecmdr.composeapp.generated.resources.setting_PowerOffTaps_Single_option
import org.jetbrains.compose.resources.StringResource

enum class PowerOffTaps(
  val option: StringResource,
  val description: StringResource,
) {
  Single(Res.string.setting_PowerOffTaps_Single_option, Res.string.setting_PowerOffTaps_Single),
  Double(Res.string.setting_PowerOffTaps_Double_option, Res.string.setting_PowerOffTaps_Double),
}
