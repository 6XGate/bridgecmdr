import org.jetbrains.compose.desktop.application.dsl.TargetFormat
import org.jetbrains.kotlin.gradle.dsl.JvmTarget

plugins {
  alias(libs.plugins.kotlin.multiplatform)
  alias(libs.plugins.android.application)
  alias(libs.plugins.compose.multiplatform)
  alias(libs.plugins.compose.compiler)
  alias(libs.plugins.compose.hotReload)
  alias(libs.plugins.kotlin.serialization)
}

kotlin {
  androidTarget {
    compilerOptions {
      jvmTarget.set(JvmTarget.JVM_11)
    }
  }

  jvm()

  sourceSets {
    androidMain.dependencies {
      implementation(compose.preview)
      implementation(libs.androidx.activity.compose)
      implementation(libs.koin.android)
      implementation(libs.koin.androidx.compose)
      implementation(libs.slf4j)
      implementation(libs.uk.slf4j)
      implementation(libs.ktor.client.auth)
      implementation(libs.codeScanner)
    }

    commonMain.dependencies {
      implementation(compose.runtime)
      implementation(compose.foundation)
      implementation(compose.material3)
      implementation(compose.ui)
      implementation(compose.components.resources)
      implementation(compose.components.uiToolingPreview)
      implementation(libs.kotlin.serialization.json)
      implementation(libs.androidx.datastore)
      implementation(libs.androidx.datastore.preferences)
      implementation(libs.androidx.lifecycle.viewmodelCompose)
      implementation(libs.androidx.lifecycle.runtimeCompose)
      implementation(libs.androidx.navigation.compose)
      implementation(libs.ktor.client.core)
      implementation(libs.ktor.client.cio)
      implementation(libs.ktor.client.contentNegotiation)
      implementation(libs.ktor.serializationJson)
      implementation(libs.koin.core)
      implementation(libs.koin.logger.slf4j)
      implementation(libs.koin.compose)
      implementation(libs.koin.compose.viewmodel)
      implementation(libs.koin.compose.viewmodel.navigation)
      implementation(libs.reorderable)
      implementation(libs.coil.compose)
      implementation(libs.coil.svg)
      implementation(libs.konform)
      implementation(libs.atlassian.onetime)
      implementation(libs.oshai.logging)
    }
    commonTest.dependencies {
      implementation(libs.kotlin.test)
      implementation(libs.koin.test)
    }
    jvmMain.dependencies {
      implementation(compose.desktop.currentOs)
      implementation(libs.kotlinx.coroutines.swing)
      implementation(libs.ktor.network)
      implementation(libs.ktor.network.tlsCertificates)
      implementation(libs.ktor.server.core)
      implementation(libs.ktor.server.cio)
      implementation(libs.ktor.server.netty)
      implementation(libs.ktor.server.di)
      implementation(libs.ktor.server.auth)
      implementation(libs.ktor.server.contentNegotiation)
      implementation(libs.ktor.server.requestValidation)
      implementation(libs.ktor.server.resources)
      implementation(libs.ktor.server.statusPages)
      implementation(libs.exposed.core)
      implementation(libs.exposed.dao)
      implementation(libs.exposed.jdbc)
      implementation(libs.exposed.migration.core)
      implementation(libs.exposed.migration.jdbc)
      implementation(libs.koin.ktor)
      implementation(libs.dbus.core)
      implementation(libs.dbus.transport.nativeUnixsocket)
      implementation(libs.filekit.dialogs.compose)
      implementation(libs.jserialcomm)
      implementation(libs.logback)
      implementation(libs.sqlite)
      implementation(libs.zxing.core)
    }
    jvmTest.dependencies {
      implementation(libs.ktor.server.testHost)
      implementation(libs.kotlin.testJunit)
    }
  }
}

android {
  namespace = "org.sleepingcats.bridgecmdr"
  compileSdk =
    libs.versions.android.compileSdk
      .get()
      .toInt()

  defaultConfig {
    applicationId = "org.sleepingcats.bridgecmdr"
    minSdk =
      libs.versions.android.minSdk
        .get()
        .toInt()
    targetSdk =
      libs.versions.android.targetSdk
        .get()
        .toInt()
    versionCode = 1
    versionName = "1.0"
  }
  packaging {
    resources {
      excludes += "/META-INF/{AL2.0,LGPL2.1}"
    }
  }
  buildTypes {
    getByName("release") {
      isMinifyEnabled = false
      manifestPlaceholders["usesCleartextTraffic"] = "false"
    }
    getByName("debug") {
      manifestPlaceholders["usesCleartextTraffic"] = "true"
    }
  }
  compileOptions {
    sourceCompatibility = JavaVersion.VERSION_11
    targetCompatibility = JavaVersion.VERSION_11
  }
}

dependencies {
  debugImplementation(compose.uiTooling)
}

compose.desktop {
  application {
    mainClass = "org.sleepingcats.bridgecmdr.MainKt"

    nativeDistributions {
      targetFormats(TargetFormat.Dmg, TargetFormat.Msi, TargetFormat.Deb, TargetFormat.AppImage)
      packageName = "BridgeCmdr"
      packageVersion = "3.0.0"
      description = "Controller for professional A/V monitors and switches"
      copyright = "© 2019-2026 Matthew Holder"
      vendor = "Matthew Holder"
      licenseFile.set(project.file("LICENSE"))

      windows {
        // iconFile.set(project.file("src/jvmMain/resources/drawable/app_icon.ico"))
        upgradeUuid = "D4E6F2B2-1C3A-4F5D-8E2A-9C6B7D8E9F0A"
      }

      macOS {
        // iconFile.set(project.file("src/jvmMain/resources/drawable/app_icon.icns"))
        bundleID = "org.sleepingcats.bridgecmdr"
        appCategory = "public.app-category.utilities"
        minimumSystemVersion = "10.13"
      }

      linux {
        iconFile.set(project.file("src/jvmMain/resources/drawable/app_icon.png"))
        packageName = "bridgecmdr"
        appRelease = "1"
        debMaintainer = "sixxgate@hotmail.com"
        rpmLicenseType = "GPL-3.0-or-later"
      }
    }

    // This is an open-source application, so we can disable
    // code obfuscation.
    buildTypes.release.proguard {
      obfuscate.set(false)
      isEnabled = false
    }
  }
}
