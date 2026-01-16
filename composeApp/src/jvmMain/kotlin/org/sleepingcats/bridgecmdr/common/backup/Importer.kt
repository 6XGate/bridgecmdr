@file:OptIn(ExperimentalPathApi::class, ExperimentalUuidApi::class)

package org.sleepingcats.bridgecmdr.common.backup

import io.github.oshai.kotlinlogging.KLogger
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import org.sleepingcats.bridgecmdr.common.backup.model.Version1
import org.sleepingcats.bridgecmdr.common.backup.model.Version2
import org.sleepingcats.bridgecmdr.common.backup.model.Version3
import org.sleepingcats.bridgecmdr.common.backup.model.Version4
import org.sleepingcats.bridgecmdr.common.backup.model.Version5
import org.sleepingcats.bridgecmdr.common.service.UserImageService
import org.sleepingcats.bridgecmdr.common.service.model.Device
import org.sleepingcats.bridgecmdr.common.service.model.Source
import org.sleepingcats.bridgecmdr.common.service.model.Tie
import org.sleepingcats.bridgecmdr.common.service.model.UserImage
import org.sleepingcats.bridgecmdr.ui.repository.DeviceRepository
import org.sleepingcats.bridgecmdr.ui.repository.SettingsRepository
import org.sleepingcats.bridgecmdr.ui.repository.SourceRepository
import org.sleepingcats.bridgecmdr.ui.repository.TieRepository
import java.nio.file.Files
import java.nio.file.Path
import java.util.zip.ZipInputStream
import kotlin.io.path.ExperimentalPathApi
import kotlin.io.path.inputStream
import kotlin.uuid.ExperimentalUuidApi

class Importer(
  private val logger: KLogger,
  private val settingsRepository: SettingsRepository,
  private val userImageService: UserImageService,
  private val sourceRepository: SourceRepository,
  private val deviceRepository: DeviceRepository,
  private val tieRepository: TieRepository,
) {
  @Serializable
  data class BackupBase(
    val version: Int = 1,
  )

  private val partialJson = Json { ignoreUnknownKeys = true }

  private fun getType(name: String) =
    when {
      name.endsWith(".png") -> "image/png"
      name.endsWith(".jpg") || name.endsWith(".jpeg") -> "image/jpeg"
      name.endsWith(".svg") -> "image/svg+xml"
      name.endsWith(".gif") -> "image/gif"
      else -> "application/octet-stream"
    }

  suspend operator fun invoke(path: Path) =
    withContext(Dispatchers.IO) {
      val tempPath =
        checkNotNull(Files.createTempDirectory("bridgecmdr-import-${path.fileName}")) {
          "Failed to create temp directory for import"
        }

      // Read the ZIP file and extract its contents. This should be all the images, and the configuration file.
      val imageCache = mutableMapOf<String, ByteArray>()
      val zipStream = ZipInputStream(path.inputStream())
      val backup =
        zipStream.use {
          var rawConfig: String? = null
          var backupBase: BackupBase? = null
          while (true) {
            val entry = zipStream.nextEntry ?: break
            AutoCloseable { zipStream.closeEntry() }.use closeEntry@{
              if (entry.isDirectory) return@closeEntry

              when {
                // Loading the configuration.
                entry.name == "config.json" -> {
                  rawConfig = zipStream.readBytes().toString(Charsets.UTF_8)
                  backupBase = partialJson.decodeFromString<BackupBase>(rawConfig)
                }

                // Saving the images to image cache.
                else -> {
                  imageCache[entry.name] = zipStream.readBytes()
                }
              }
            }
          }

          checkNotNull(rawConfig) { "Failed to find configuration information from import file" }
          checkNotNull(backupBase) { "Failed to find configuration information from import file" }

          logger.info { "Importing backup version ${backupBase.version}" }
          when (backupBase.version) {
            1 -> Version1.parseBackup(rawConfig)
            2 -> Version2.parseBackup(rawConfig)
            3 -> Version3.parseBackup(rawConfig)
            4 -> Version4.parseBackup(rawConfig)
            5 -> Version5.parseBackup(rawConfig)
            else -> throw NotImplementedError("Unsupported backup version: ${backupBase.version}")
          }
        }

      // Import images first, associated with their names for referencing in sources.
      val images =
        imageCache.mapValues { (name, data) ->
          userImageService.upsert(UserImage.New(data = data, type = getType(name)))
        }

      // Import sources, run sequentially to prevent SQLite exclusive lock errors.
      for (source in backup.layouts.sources) {
        runCatching {
          sourceRepository.upsert(
            Source(
              id = source.id,
              title = source.title,
              image = source.image?.let { name -> images[name]?.id },
            ),
          )
        }.onFailure { throwable -> logger.error(throwable) { "Failed to import Source ${source.title}" } }
      }

      // Import devices, run sequentially to prevent SQLite exclusive lock errors.
      for (device in backup.layouts.devices) {
        runCatching {
          deviceRepository.upsert(
            Device(
              id = device.id,
              driverId = device.driverId,
              title = device.title,
              path = device.path,
            ),
          )
        }.onFailure { throwable -> logger.error(throwable) { "Failed to import device ${device.title}" } }
      }

      // Import ties, run sequentially to prevent SQLite exclusive lock errors.
      for (tie in backup.layouts.ties) {
        runCatching {
          tieRepository.upsert(
            Tie(
              id = tie.id,
              sourceId = tie.sourceId,
              deviceId = tie.deviceId,
              inputChannel = tie.inputChannel,
              outputVideoChannel = tie.outputVideoChannel,
              outputAudioChannel = tie.outputAudioChannel,
            ),
          )
        }.onFailure { throwable -> logger.error(throwable) { "Failed to import Tie ${tie.id}" } }
      }

      // Finally, import the settings.
      settingsRepository.apply {
        backup.settings?.let { settings ->
          setAppTheme(settings.appTheme)
          setIconSize(settings.iconSize)
          setPowerOnDevicesAtStart(settings.powerOnDevicesAtStart)
          setPowerOffTaps(settings.powerOffTaps)
          setButtonOrder(settings.buttonOrder)
        }
      }
    }
}
