package org.sleepingcats.bridgecmdr.ui.service.xdg.entry

sealed interface Line {
  val rawText: String
}

sealed interface SectionLine {
  val rawText: String
}

@ConsistentCopyVisibility
data class Comment internal constructor(
  val content: String,
) : Line,
  SectionLine {
  override val rawText: String get() = "#$content"
}

@ConsistentCopyVisibility
data class BlankLine internal constructor(
  override val rawText: String = "",
) : Line,
  SectionLine

@ConsistentCopyVisibility
data class Section internal constructor(
  val name: String,
  val lines: MutableList<SectionLine> = mutableListOf(),
) : Line {
  override val rawText: String get() = "[$name]"
}

@ConsistentCopyVisibility
data class Entry internal constructor(
  val name: String,
  var value: String,
) : SectionLine {
  override val rawText: String get() = "$name=$value"
}
