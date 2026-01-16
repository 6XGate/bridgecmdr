package org.sleepingcats.bridgecmdr.ui.components

import androidx.compose.runtime.Composable
import io.github.vinceglb.filekit.PlatformFile
import io.github.vinceglb.filekit.dialogs.FileKitDialogSettings
import io.github.vinceglb.filekit.dialogs.FileKitType
import io.github.vinceglb.filekit.dialogs.compose.rememberFilePickerLauncher

@Composable
fun rememberImagePickerLauncher(
  title: String? = null,
  directory: PlatformFile? = null,
  dialogSettings: FileKitDialogSettings = FileKitDialogSettings.createDefault(),
  onResult: (PlatformFile?) -> Unit,
) = rememberFilePickerLauncher(
  type = FileKitType.File("png", "jpg", "jpeg", "svg"),
  title = title,
  directory = directory,
  dialogSettings = dialogSettings,
  onResult = onResult,
)
