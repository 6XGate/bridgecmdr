package org.sleepingcats.bridgecmdr.common.module

import org.koin.core.module.dsl.singleOf
import org.koin.dsl.bind
import org.koin.dsl.module
import org.sleepingcats.bridgecmdr.common.service.DeviceService
import org.sleepingcats.bridgecmdr.common.service.DriverService
import org.sleepingcats.bridgecmdr.common.service.LegacySettingsService
import org.sleepingcats.bridgecmdr.common.service.PowerService
import org.sleepingcats.bridgecmdr.common.service.SerialPortService
import org.sleepingcats.bridgecmdr.common.service.SourceService
import org.sleepingcats.bridgecmdr.common.service.TieService
import org.sleepingcats.bridgecmdr.common.service.UserImageService
import org.sleepingcats.bridgecmdr.common.service.remote.RemoteDeviceService
import org.sleepingcats.bridgecmdr.common.service.remote.RemoteDriverService
import org.sleepingcats.bridgecmdr.common.service.remote.RemoteLegacySettingsService
import org.sleepingcats.bridgecmdr.common.service.remote.RemotePowerService
import org.sleepingcats.bridgecmdr.common.service.remote.RemoteSerialPortService
import org.sleepingcats.bridgecmdr.common.service.remote.RemoteSourceService
import org.sleepingcats.bridgecmdr.common.service.remote.RemoteTieService
import org.sleepingcats.bridgecmdr.common.service.remote.RemoteUserImageService

var remoteServiceModule =
  module {
    singleOf(::RemoteDeviceService) bind DeviceService::class
    singleOf(::RemoteDriverService) bind DriverService::class
    singleOf(::RemotePowerService) bind PowerService::class
    singleOf(::RemoteLegacySettingsService) bind LegacySettingsService::class
    singleOf(::RemoteSerialPortService) bind SerialPortService::class
    singleOf(::RemoteSourceService) bind SourceService::class
    singleOf(::RemoteTieService) bind TieService::class
    singleOf(::RemoteUserImageService) bind UserImageService::class
  }
