@file:OptIn(ExperimentalUuidApi::class)

package org.sleepingcats.bridgecmdr.common.service.local

import io.ktor.server.plugins.BadRequestException
import io.ktor.server.plugins.NotFoundException
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.jetbrains.exposed.v1.core.alias
import org.jetbrains.exposed.v1.core.count
import org.jetbrains.exposed.v1.core.eq
import org.jetbrains.exposed.v1.core.statements.api.ExposedBlob
import org.jetbrains.exposed.v1.jdbc.deleteReturning
import org.jetbrains.exposed.v1.jdbc.select
import org.jetbrains.exposed.v1.jdbc.transactions.transaction
import org.koin.core.component.KoinComponent
import org.sleepingcats.bridgecmdr.common.extension.insertOrGetId
import org.sleepingcats.bridgecmdr.common.service.DatabaseService
import org.sleepingcats.bridgecmdr.common.service.UserImageService
import org.sleepingcats.bridgecmdr.common.service.model.NewUserImage
import org.sleepingcats.bridgecmdr.common.service.model.UserImage
import org.sleepingcats.bridgecmdr.common.service.table.UserImagesTable
import org.sleepingcats.core.ErrorHandler
import kotlin.uuid.ExperimentalUuidApi
import kotlin.uuid.Uuid
import kotlin.uuid.toJavaUuid
import kotlin.uuid.toKotlinUuid

class LocalUserImageService(
  private val databaseService: DatabaseService,
) : KoinComponent,
  UserImageService {
  override suspend fun all(): List<UserImage> =
    withContext(Dispatchers.IO) {
      transaction(databaseService.get()) {
        UserImagesTable
          .select(
            UserImagesTable.id,
            UserImagesTable.data,
            UserImagesTable.type,
            UserImagesTable.hash,
          ).map {
            UserImage(
              it[UserImagesTable.id].value.toKotlinUuid(),
              it[UserImagesTable.data].bytes,
              it[UserImagesTable.type],
              it[UserImagesTable.hash],
            )
          }
      }
    }

  override suspend fun findById(id: Uuid): UserImage =
    tryFindById(id) ?: throw NotFoundException("Image with ID $id not found")

  override suspend fun tryFindById(id: Uuid): UserImage? =
    withContext(Dispatchers.IO) {
      transaction(databaseService.get()) {
        UserImagesTable
          .select(
            UserImagesTable.id,
            UserImagesTable.data,
            UserImagesTable.type,
            UserImagesTable.hash,
          ).where(UserImagesTable.id eq id.toJavaUuid())
          .limit(1)
          .firstOrNull()
          ?.let {
            UserImage(
              it[UserImagesTable.id].value.toKotlinUuid(),
              it[UserImagesTable.data].bytes,
              it[UserImagesTable.type],
              it[UserImagesTable.hash],
            )
          }
      }
    }

  suspend fun verifyById(
    id: Uuid,
    onError: ErrorHandler = { msg -> throw BadRequestException(msg) },
  ): Unit =
    withContext(Dispatchers.IO) {
      transaction(databaseService.get()) {
        val countExpression = UserImagesTable.id.count().alias("count")
        val count =
          UserImagesTable
            .select(countExpression)
            .where(UserImagesTable.id eq id.toJavaUuid())
            .first()[countExpression]

        if (count == 0L) onError("Image with ID $id not found")
      }
    }

  override suspend fun upsert(image: UserImage.New): UserImage =
    withContext(Dispatchers.IO) {
      val newImage = NewUserImage(image.data, image.type)
      val id =
        transaction(databaseService.get()) {
          UserImagesTable
            .insertOrGetId({ hash eq newImage.hash }) {
              it[data] = ExposedBlob(newImage.bytes)
              it[type] = newImage.type
              it[hash] = newImage.hash
            } ?: throw IllegalStateException("Image with upsert failed")
        }
      UserImage(
        id.value.toKotlinUuid(),
        newImage.bytes,
        newImage.type,
        newImage.hash,
      )
    }

  override suspend fun deleteById(id: Uuid): UserImage =
    withContext(Dispatchers.IO) {
      transaction(databaseService.get()) {
        UserImagesTable
          .deleteReturning(
            returning =
              listOf(
                UserImagesTable.id,
                UserImagesTable.data,
                UserImagesTable.type,
                UserImagesTable.hash,
              ),
            where = { UserImagesTable.id eq id.toJavaUuid() },
          ).firstOrNull()
          ?.let {
            UserImage(
              it[UserImagesTable.id].value.toKotlinUuid(),
              it[UserImagesTable.data].bytes,
              it[UserImagesTable.type],
              it[UserImagesTable.hash],
            )
          }
          ?: throw NotFoundException("Image with ID $id not found")
      }
    }
}
