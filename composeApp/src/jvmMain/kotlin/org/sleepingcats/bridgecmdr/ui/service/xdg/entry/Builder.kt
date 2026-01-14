package org.sleepingcats.bridgecmdr.ui.service.xdg.entry

class Builder internal constructor() {
  private var file = DesktopEntryFile()

  fun comment(content: String) {
    file.lines.add(Comment(content))
  }

  fun section(
    name: String,
    block: SectionBuilder.() -> Unit,
  ) {
    file.lines.add(SectionBuilder(name).apply(block).build())
  }

  fun build(): DesktopEntryFile = file
}

class SectionBuilder internal constructor(
  name: String,
) {
  private val section = Section(name)

  fun comment(content: String) {
    section.lines.add(Comment(content))
  }

  fun set(
    name: String,
    value: String,
    encoder: Value<String>,
  ) {
    require(section.lines.find { it is Entry && it.name == name } == null) { "Entry for \"$this\" already exists" }
    section.lines.add(Entry(name, encoder.encode(value)))
  }

  fun set(
    name: String,
    value: String,
  ) {
    require(section.lines.find { it is Entry && it.name == name } == null) { "Entry for \"$this\" already exists" }
    section.lines.add(Entry(name, LocaleString.encode(value)))
  }

  fun set(
    name: String,
    value: List<String>,
    encoder: Value<List<String>>,
  ) {
    require(section.lines.find { it is Entry && it.name == name } == null) { "Entry for \"$this\" already exists" }
    section.lines.add(Entry(name, encoder.encode(value)))
  }

  fun set(
    name: String,
    value: List<String>,
  ) {
    require(section.lines.find { it is Entry && it.name == name } == null) { "Entry for \"$this\" already exists" }
    section.lines.add(Entry(name, ListOfLocaleStrings.encode(value)))
  }

  fun set(
    name: String,
    value: Int,
  ) {
    require(section.lines.find { it is Entry && it.name == name } == null) { "Entry for \"$this\" already exists" }
    section.lines.add(Entry(name, NumericValue.encode(value.toFloat())))
  }

  fun set(
    name: String,
    value: Float,
  ) {
    require(section.lines.find { it is Entry && it.name == name } == null) { "Entry for \"$this\" already exists" }
    section.lines.add(Entry(name, NumericValue.encode(value)))
  }

  fun set(
    name: String,
    value: Boolean,
  ) {
    require(section.lines.find { it is Entry && it.name == name } == null) { "Entry for \"$this\" already exists" }
    section.lines.add(Entry(name, BooleanValue.encode(value)))
  }

  fun build(): Section = section
}
