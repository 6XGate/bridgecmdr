package org.sleepingcats.bridgecmdr.common.extension

import io.github.vinceglb.filekit.dialogs.compose.PickerResultLauncher

operator fun PickerResultLauncher.invoke() {
  this.launch()
}
