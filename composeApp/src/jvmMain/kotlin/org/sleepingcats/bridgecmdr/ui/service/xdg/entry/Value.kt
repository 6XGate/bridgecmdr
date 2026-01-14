package org.sleepingcats.bridgecmdr.ui.service.xdg.entry

sealed interface Value<T> {
  fun decode(raw: String): T

  fun encode(value: T): String
}

sealed interface AsciiString : Value<String> {
  companion object : AsciiString

  override fun decode(raw: String): String {
    check(raw.isValidAsciiString()) { "Invalid ASCII string: \"${raw}\"" }
    return raw.unescape()
  }

  override fun encode(value: String): String {
    check(value.isValidAsciiString()) { "Invalid ASCII string: \"${value.escape()}\"" }
    return value.escape()
  }
}

sealed interface LocaleString : Value<String> {
  companion object : LocaleString

  override fun decode(raw: String): String = raw.unescape()

  override fun encode(value: String): String = value.escape()
}

sealed interface IconString : Value<String> {
  companion object : IconString

  override fun decode(raw: String): String = raw.unescape()

  override fun encode(value: String): String = value.escape()
}

sealed interface BooleanValue : Value<Boolean> {
  companion object : BooleanValue

  override fun decode(raw: String): Boolean =
    when (raw) {
      "true" -> true
      "false" -> false
      else -> throw IllegalStateException("Invalid boolean value: \"$raw\"")
    }

  override fun encode(value: Boolean): String = if (value) "true" else "false"
}

sealed interface NumericValue : Value<Float> {
  companion object : NumericValue

  override fun decode(raw: String): Float = checkNotNull(raw.toFloatOrNull()) { "Invalid numeric value: \"$raw\"" }

  override fun encode(value: Float): String = value.toString()
}

sealed interface ListOf<T : Value<String>> : Value<List<String>> {
  val entryOf: T

  override fun decode(raw: String): List<String> = raw.splitList().map { entryOf.decode(it) }

  override fun encode(value: List<String>): String =
    value.joinToString(";", postfix = ";") {
      entryOf.encode(it).replace(";", "\\;")
    }
}

sealed interface ListOfAsciiStrings : ListOf<AsciiString> {
  companion object : ListOfAsciiStrings

  override val entryOf: AsciiString
    get() = AsciiString
}

sealed interface ListOfLocaleStrings : ListOf<LocaleString> {
  companion object : ListOfLocaleStrings

  override val entryOf: LocaleString
    get() = LocaleString
}

sealed interface ListOfIconStrings : ListOf<IconString> {
  companion object : ListOfIconStrings

  override val entryOf: IconString
    get() = IconString
}
