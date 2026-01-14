package org.sleepingcats.bridgecmdr.common.service.model

import bridgecmdr.composeapp.generated.resources.Res
import bridgecmdr.composeapp.generated.resources.device_PathType_Port
import bridgecmdr.composeapp.generated.resources.device_PathType_Remote
import org.jetbrains.compose.resources.StringResource

enum class PathType(
  val label: StringResource,
  val prefix: String,
) {
  Port(Res.string.device_PathType_Port, "port:"),
  Remote(Res.string.device_PathType_Remote, "ip:"),
  ;

  val startIndex: Int
    get() = prefix.length
}
