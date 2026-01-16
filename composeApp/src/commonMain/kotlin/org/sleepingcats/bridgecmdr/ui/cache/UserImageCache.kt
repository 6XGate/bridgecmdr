@file:OptIn(ExperimentalUuidApi::class)

package org.sleepingcats.bridgecmdr.ui.cache

import coil3.ImageLoader
import coil3.decode.DataSource
import coil3.decode.ImageSource
import coil3.fetch.FetchResult
import coil3.fetch.Fetcher
import coil3.fetch.SourceFetchResult
import coil3.key.Keyer
import coil3.request.Options
import okio.Buffer
import org.sleepingcats.bridgecmdr.common.service.UserImageService
import kotlin.uuid.ExperimentalUuidApi
import kotlin.uuid.Uuid

class UserImageCache(
  private val service: UserImageService,
  private val options: Options,
  private val id: Uuid,
) : Fetcher {
  class KeyOf : Keyer<Uuid> {
    override fun key(
      data: Uuid,
      options: Options,
    ): String = data.toString()
  }

  class Factory(
    private val service: UserImageService,
  ) : Fetcher.Factory<Uuid> {
    override fun create(
      data: Uuid,
      options: Options,
      imageLoader: ImageLoader,
    ): Fetcher = UserImageCache(service, options, data)
  }

  override suspend fun fetch(): FetchResult? {
    val userImage = service.tryFindById(id) ?: return null
    return SourceFetchResult(
      source =
        ImageSource(
          source = Buffer().apply { write(userImage.data) },
          fileSystem = options.fileSystem,
        ),
      mimeType = userImage.type,
      dataSource = DataSource.NETWORK,
    )
  }
}
