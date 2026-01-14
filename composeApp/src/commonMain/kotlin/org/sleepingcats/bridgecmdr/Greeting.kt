package org.sleepingcats.bridgecmdr

import org.sleepingcats.core.Platform

object Greeting {
  fun greet(): String = "Hello, ${Platform.name}!"
}
