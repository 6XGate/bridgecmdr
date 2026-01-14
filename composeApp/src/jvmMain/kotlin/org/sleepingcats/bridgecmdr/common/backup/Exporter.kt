@file:OptIn(ExperimentalUuidApi::class)

package org.sleepingcats.bridgecmdr.common.backup

import io.github.oshai.kotlinlogging.KLogger
import io.github.vinceglb.filekit.mimeType.MimeType
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.async
import kotlinx.coroutines.flow.last
import kotlinx.coroutines.flow.take
import kotlinx.coroutines.withContext
import kotlinx.serialization.json.Json
import org.sleepingcats.bridgecmdr.common.backup.model.Version4
import org.sleepingcats.bridgecmdr.common.backup.model.Version5
import org.sleepingcats.bridgecmdr.common.service.DeviceService
import org.sleepingcats.bridgecmdr.common.service.SourceService
import org.sleepingcats.bridgecmdr.common.service.TieService
import org.sleepingcats.bridgecmdr.common.service.UserImageService
import org.sleepingcats.bridgecmdr.ui.repository.SettingsRepository
import java.nio.file.Path
import java.util.zip.ZipEntry
import java.util.zip.ZipOutputStream
import kotlin.io.path.outputStream
import kotlin.uuid.ExperimentalUuidApi

class Exporter(
  private val logger: KLogger,
  private val settingsRepository: SettingsRepository,
  private val userImageService: UserImageService,
  private val sourceService: SourceService,
  private val deviceService: DeviceService,
  private val tieService: TieService,
) {
  private fun mimeTypeToExt(type: String) =
    when (MimeType.parse(type).subtype) {
      "png" -> "png"
      "jpeg" -> "jpg"
      "gif" -> "gif"
      "svg+xml" -> "svg"
      else -> "bin"
    }

  suspend operator fun invoke(path: Path) =
    withContext(Dispatchers.IO) {
      ZipOutputStream(path.outputStream()).use { zipStream ->
        val settings = settingsRepository.data.take(1).last()
        val sources = async { sourceService.all() }
        val devices = async { deviceService.all() }
        val ties = async { tieService.all() }
        val images = async { userImageService.all() }

        val imageNames =
          images.await().associate { image ->
            val id = image.id
            val extension = mimeTypeToExt(image.type)
            val name = "$id.$extension"

            zipStream.putNextEntry(ZipEntry("${image.id.toHexDashString()}.$extension"))
            AutoCloseable { zipStream.closeEntry() }.use { zipStream.write(image.data) }
            Pair(id, name)
          }

        val backup =
          Version5.Backup(
            version = 5,
            settings =
              Version5.Settings(
                appTheme = settings.appTheme,
                iconSize = settings.iconSize,
                powerOnDevicesAtStart = settings.powerOnDevicesAtStart,
                powerOffTaps = settings.powerOffTaps,
                buttonOrder = settings.buttonOrder,
              ),
            layouts =
              Version4.Layouts(
                sources =
                  sources.await().map { source ->
                    Version4.Source(
                      id = source.id,
                      title = source.title,
                      image = source.image?.let { imageNames[it] },
                    )
                  },
                devices =
                  devices.await().map { device ->
                    Version4.Device(
                      id = device.id,
                      driverId = device.driverId,
                      title = device.title,
                      path = device.path,
                    )
                  },
                ties =
                  ties.await().map { tie ->
                    Version4.Tie(
                      id = tie.id,
                      sourceId = tie.sourceId,
                      deviceId = tie.deviceId,
                      inputChannel = tie.inputChannel,
                      outputVideoChannel = tie.outputVideoChannel,
                      outputAudioChannel = tie.outputAudioChannel,
                    )
                  },
              ),
          )

        zipStream.putNextEntry(ZipEntry("config.json"))
        AutoCloseable { zipStream.closeEntry() }
          .use { zipStream.write(Json.encodeToString(backup).toByteArray(Charsets.UTF_8)) }
      }
    }
}
