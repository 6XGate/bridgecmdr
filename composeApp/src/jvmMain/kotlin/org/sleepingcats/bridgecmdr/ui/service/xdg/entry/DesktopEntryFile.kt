package org.sleepingcats.bridgecmdr.ui.service.xdg.entry

import java.nio.file.Path

class DesktopEntryFile(
  internal val lines: MutableList<Line> = mutableListOf(),
) : Iterable<String> {
  companion object {
    fun create(block: Builder.() -> Unit): DesktopEntryFile = Builder().apply(block).build()

    fun read(path: Path): DesktopEntryFile = parse(path.toFile().readText())

    fun parse(text: String): DesktopEntryFile {
      val lineEnding = if (text.contains("\r\n")) "\r\n" else "\n"
      return parse(text, lineEnding)
    }

    fun parse(
      text: String,
      lineEnding: String = "\n",
    ): DesktopEntryFile {
      val rawLines = text.split(lineEnding)
      return parse(rawLines)
    }

    fun parse(rawLines: Iterable<String>): DesktopEntryFile {
      val lines = mutableListOf<Line>()
      var section: Section? = null

      for ((index, rawLine) in rawLines.withIndex()) {
        val openBracketIndex = rawLine.indexOf('[')
        val closeBracketIndex = rawLine.indexOf(']')
        val commentHashIndex = rawLine.indexOf('#')
        val equalsIndexIndex = rawLine.indexOf('=')

        when {
          openBracketIndex == 0 && closeBracketIndex > 0 -> {
            val groupName = rawLine.substring(1, closeBracketIndex)
            check(groupName.isValidGroupName()) { "$index: error: Invalid group name \"$groupName\"" }
            if (section != null) {
              lines.add(section)
            }

            section = Section(groupName)
          }

          commentHashIndex == 0 -> {
            if (section != null) {
              section.lines.add(Comment(rawLine.substring(1)))
            } else {
              lines.add(Comment(rawLine.substring(1)))
            }
          }

          equalsIndexIndex > 0 -> {
            check(section != null) { "$index: error: Entry found outside of any section" }

            val name = rawLine.substring(0, equalsIndexIndex).trimEnd()
            val value = rawLine.substring(equalsIndexIndex + 1).trimStart()
            check(name.isValidKey()) { "$index: error: Invalid key \"$name\"" }

            section.lines.add(Entry(name, value))
          }

          rawLine.isBlank() -> {
            if (section != null) {
              section.lines.add(BlankLine(rawLine))
            } else {
              lines.add(BlankLine(rawLine))
            }

            continue
          }

          else -> {
            throw IllegalStateException("$index: error: Unknown data at \"$rawLine\"")
          }
        }
      }

      if (section != null) {
        lines.add(section)
      }

      check(lines.find { it is Section && it.name == "Desktop Entry" } != null) {
        "No \"Desktop Entry\" section found"
      }

      return DesktopEntryFile(lines)
    }
  }

  override operator fun iterator() =
    iterator {
      for (line in lines) {
        when (line) {
          is Section -> {
            yield(line.rawText)
            for (sectionLine in line.lines) {
              yield(sectionLine.rawText)
            }
          }

          else -> {
            yield(line.rawText)
          }
        }
      }
    }

  private fun getRawValue(
    section: String,
    name: String,
  ): String? {
    require(section.isValidGroupName()) { "Invalid section name: \"$section\"" }
    require(name.isValidKey()) { "Invalid key name: \"$name\"" }
    val sec = lines.find { it is Section && it.name == section }?.let { it as? Section } ?: return null
    val entry = sec.lines.find { it is Entry && it.name == name }?.let { it as? Entry } ?: return null
    return entry.value
  }

  fun <V, T : Value<V>> get(
    section: String,
    name: String,
    decodeAs: T,
  ): V? = getRawValue(section, name)?.let { decodeAs.decode(it) }

  private fun setRawValue(
    section: String,
    name: String,
    value: String,
  ) {
    require(section.isValidGroupName()) { "Invalid section name: \"$section\"" }
    require(name.isValidKey()) { "Invalid key name: \"$name\"" }

    val sec =
      lines.find { it is Section && it.name == section }?.let { it as? Section }
        ?: Section(section).also { lines.add(it) }

    val entry = sec.lines.find { it is Entry && it.name == name }?.let { it as? Entry }
    if (entry != null) {
      entry.value = value
      return
    }

    sec.lines.add(Entry(name, value))
  }

  fun <T : Value<String>> set(
    section: String,
    name: String,
    value: String,
    encodeAs: T,
  ) {
    setRawValue(section, name, encodeAs.encode(value))
  }

  fun set(
    section: String,
    name: String,
    value: String,
  ) {
    setRawValue(section, name, LocaleString.encode(value))
  }

  fun set(
    section: String,
    name: String,
    value: Int,
  ) {
    setRawValue(section, name, NumericValue.encode(value.toFloat()))
  }

  fun set(
    section: String,
    name: String,
    value: Float,
  ) {
    setRawValue(section, name, NumericValue.encode(value))
  }

  fun set(
    section: String,
    name: String,
    value: Boolean,
  ) {
    setRawValue(section, name, BooleanValue.encode(value))
  }
}
