package org.sleepingcats.bridgecmdr.common.module

import org.koin.core.module.Module
import org.koin.core.module.dsl.singleOf
import org.koin.dsl.binds
import org.koin.dsl.module
import org.sleepingcats.bridgecmdr.common.service.DeviceService
import org.sleepingcats.bridgecmdr.common.service.DriverService
import org.sleepingcats.bridgecmdr.common.service.LegacySettingsService
import org.sleepingcats.bridgecmdr.common.service.PowerService
import org.sleepingcats.bridgecmdr.common.service.SerialPortService
import org.sleepingcats.bridgecmdr.common.service.SourceService
import org.sleepingcats.bridgecmdr.common.service.TieService
import org.sleepingcats.bridgecmdr.common.service.UserImageService
import org.sleepingcats.bridgecmdr.common.service.local.LocalDeviceService
import org.sleepingcats.bridgecmdr.common.service.local.LocalDriverService
import org.sleepingcats.bridgecmdr.common.service.local.LocalLegacySettingsService
import org.sleepingcats.bridgecmdr.common.service.local.LocalPowerService
import org.sleepingcats.bridgecmdr.common.service.local.LocalSerialPortService
import org.sleepingcats.bridgecmdr.common.service.local.LocalSourceService
import org.sleepingcats.bridgecmdr.common.service.local.LocalTieService
import org.sleepingcats.bridgecmdr.common.service.local.LocalUserImageService

val localServiceModule: Module =
  module {
    singleOf(::LocalDriverService) binds arrayOf(LocalDriverService::class, DriverService::class)
    singleOf(::LocalDeviceService) binds arrayOf(LocalDeviceService::class, DeviceService::class)
    singleOf(::LocalLegacySettingsService) binds
      arrayOf(LocalLegacySettingsService::class, LegacySettingsService::class)
    singleOf(::LocalPowerService) binds arrayOf(LocalPowerService::class, PowerService::class)
    singleOf(::LocalSerialPortService) binds arrayOf(LocalSerialPortService::class, SerialPortService::class)
    singleOf(::LocalSourceService) binds arrayOf(LocalSourceService::class, SourceService::class)
    singleOf(::LocalTieService) binds arrayOf(LocalTieService::class, TieService::class)
    singleOf(::LocalUserImageService) binds arrayOf(LocalUserImageService::class, UserImageService::class)
  }
