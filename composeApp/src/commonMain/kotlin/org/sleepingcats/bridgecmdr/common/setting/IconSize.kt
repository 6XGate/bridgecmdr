package org.sleepingcats.bridgecmdr.common.setting

enum class IconSize(
  val size: Int,
  // val description: String = "$size ⨉ $size",
) {
  ExtraSmall(48),
  Small(64),
  Medium(96),
  Normal(128),
  Large(192),
  ExtraLarge(256),
}
