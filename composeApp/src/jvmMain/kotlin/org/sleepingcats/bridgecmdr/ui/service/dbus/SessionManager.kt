package org.sleepingcats.bridgecmdr.ui.service.dbus

import org.freedesktop.dbus.annotations.DBusInterfaceName
import org.freedesktop.dbus.annotations.DBusMemberName
import org.freedesktop.dbus.interfaces.DBusInterface

@DBusInterfaceName("org.freedesktop.login1.Manager")
internal interface SessionManager : DBusInterface {
  @DBusMemberName("CanPowerOff")
  fun canPowerOff(): String

  @DBusMemberName("PowerOff")
  fun powerOff(interactive: Boolean)
}
