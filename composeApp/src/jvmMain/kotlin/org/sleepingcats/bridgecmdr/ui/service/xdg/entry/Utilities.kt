package org.sleepingcats.bridgecmdr.ui.service.xdg.entry

import kotlin.text.iterator

internal val ASCII = 0x20.toChar()..0x7e.toChar()

internal val UPPER = 'A'..'Z'

internal val LOWER = 'a'..'z'

internal val DIGIT = '0'..'9'

internal fun String.isValidGroupName(): Boolean =
  this.isNotEmpty() && this.all { char -> (char in ASCII) && (char != '[') && (char != ']') }

internal fun String.isValidKey(): Boolean =
  this.isNotEmpty() &&
    this.all { char ->
      (char in UPPER) ||
        (char in LOWER) ||
        (char in DIGIT) ||
        (char == '@') ||
        (char == '_') ||
        (char == '-') ||
        (char == '[') ||
        (char == ']')
    }

internal fun String.isValidAsciiString(): Boolean = this.all { char -> char in ASCII }

private fun String.unescape(
  builder: StringBuilder,
  atIndex: Int,
): Int {
  val index = atIndex + 1
  check(index < this.length) { "Invalid escape sequence at end of string" }
  when (this[index]) {
    's' -> builder.append(' ')
    'n' -> builder.append('\n')
    't' -> builder.append('\t')
    'r' -> builder.append('\r')
    '\\' -> builder.append('\\')
    else -> throw IllegalStateException("Invalid escape sequence: \\${this[index]}")
  }

  return index
}

internal fun String.unescape(): String =
  StringBuilder()
    .apply {
      var index = 0

      while (index < this@unescape.length) {
        when (val char = this@unescape[index]) {
          '\\' -> index = unescape(this, index)
          else -> append(char)
        }

        index += 1
      }
    }.toString()

internal fun String.escape(): String =
  StringBuilder()
    .apply {
      for (char in this@escape) {
        when (char) {
          '\n' -> append("\\n")
          '\t' -> append("\\t")
          '\r' -> append("\\r")
          '\\' -> append("\\\\")
          else -> append(char)
        }
      }
    }.toString()

private fun CharIterator.unescapeInList(builder: StringBuilder) {
  check(this.hasNext()) { "Invalid escape sequence at end of string" }
  when (val char = this.next()) {
    // Leave these alone for the parser to handle
    's', 'n', 't', 'r', '\\' -> builder.append("'\\$char")

    // Only unescape \;
    ';' -> builder.append(';')

    // Anything else is invalid
    else -> throw IllegalStateException("Invalid escape sequence: \\$char")
  }
}

private fun MutableList<String>.addString(builder: StringBuilder) {
  this.add(builder.toString())
  builder.clear()
}

// Expected: results
// "" -> []
// ";" -> []
// "a" -> ["a"]
// "a;" -> ["a"]
// "a;b;c" -> ["a", "b", "c"]
// "a\;b;c" -> ["a;b", "c"]
// "a\\;b;c" -> ["a\\","b","c"]
// "a;b;c;" -> ["a", "b", "c"]
// "a\;b;c;" -> ["a;b", "c"]
// "a;;c" -> ["a","","c"]
// "a;;" -> ["a",""]
// "a;; " -> ["a","", " "]
// "a\\;b;c\;;" -> ["a\\","b","c;"]

internal fun String.splitList(): List<String> =
  mutableListOf<String>().also list@{ list ->
    // Simplify empty item handling by treating these two cases
    // as an empty list. Now any trailing semicolon indicates
    // an empty item.
    if (this == "" || this == ";") return@list

    val iterator = this.iterator()
    val builder = StringBuilder()
    while (iterator.hasNext()) {
      when (val char = iterator.next()) {
        '\\' -> iterator.unescapeInList(builder)
        ';' -> list.addString(builder)
        else -> builder.append(char)
      }
    }

    if (builder.isNotEmpty()) list.add(builder.toString())
  }
