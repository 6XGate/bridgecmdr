package org.sleepingcats.core

open class ApplicationBranding(
  val qualifier: String,
  val company: String,
  val name: String,
  val version: String,
) {
  companion object {
    private val pattern = Regex("[^A-Za-z0-9]+")
    private val trimStart = Regex("^[^A-Za-z0-9]+")
    private val trimEnd = Regex("[^A-Za-z0-9]+$")

    private fun String.qualify(separator: String) =
      this.replace(pattern, separator).replace(trimStart, "").replace(trimEnd, "")
  }

  val qualifiedQualifier = qualifier.lowercase()

  val companyQualifiedName =
    when {
      Platform.isWindows -> company.qualify(" ")
      Platform.isMac -> company.qualify("-").lowercase()
      else -> company.qualify("").lowercase()
    }

  val qualifiedName =
    when {
      Platform.isWindows -> name.qualify(" ")
      Platform.isMac -> name.qualify("-").lowercase()
      else -> name.qualify("").lowercase()
    }

  val applicationId = "$qualifiedQualifier.$qualifiedName"

  val qualifiedPath =
    when {
      Platform.isWindows -> listOf(companyQualifiedName, qualifiedName)
      Platform.isMac -> listOf(applicationId)
      else -> listOf(qualifiedName)
    }
}
