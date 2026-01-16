package org.sleepingcats.bridgecmdr.common.extension

import androidx.datastore.preferences.core.MutablePreferences
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.stringPreferencesKey
import kotlinx.serialization.KSerializer
import kotlinx.serialization.json.Json
import kotlinx.serialization.serializer

class JsonPreferencesKey<T>(
  val name: String,
  val serializer: KSerializer<T>,
) {
  val key = stringPreferencesKey(name)
  val deserializer = serializer
}

inline fun <reified T> jsonPreferencesKey(name: String) = JsonPreferencesKey(name, serializer = serializer<T>())

inline operator fun <reified T> Preferences.get(setting: JsonPreferencesKey<T>): T? =
  this[setting.key]?.let { stringValue -> Json.decodeFromString(setting.deserializer, stringValue) }

inline operator fun <reified T> MutablePreferences.set(
  setting: JsonPreferencesKey<T>,
  value: T,
) {
  this[setting.key] = Json.encodeToString(setting.serializer, value)
}
