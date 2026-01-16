package org.sleepingcats.bridgecmdr.common.extension

import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.ImageBitmap
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.graphics.toComposeImageBitmap
import com.google.zxing.common.BitMatrix
import org.jetbrains.skia.Image

fun BitMatrix.toImage(
  background: Color = Color.White,
  color: Color = Color.Black,
): Image {
  val bytes = ByteArray(4 * width * height)

  var offset = 0
  for (y in 0 until height) {
    for (x in 0 until width) {
      val color = if (get(x, y)) color.toArgb() else background.toArgb()
      bytes[offset++] = (color shr 16 and 0xFF).toByte() // R
      bytes[offset++] = (color shr 8 and 0xFF).toByte() // G
      bytes[offset++] = (color and 0xFF).toByte() // B
      bytes[offset++] = (color shr 24 and 0xFF).toByte() // A
    }
  }

  return bytes.toImage(width, height)
}

fun BitMatrix.toImageBitmap(
  background: Color = Color.White,
  color: Color = Color.Black,
): ImageBitmap = toImage(background, color).toComposeImageBitmap()
