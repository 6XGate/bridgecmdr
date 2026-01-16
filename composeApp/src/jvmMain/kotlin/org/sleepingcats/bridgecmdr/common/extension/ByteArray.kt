package org.sleepingcats.bridgecmdr.common.extension

import androidx.compose.ui.graphics.ImageBitmap
import androidx.compose.ui.graphics.toComposeImageBitmap
import org.jetbrains.skia.ColorAlphaType
import org.jetbrains.skia.ColorAlphaType.PREMUL
import org.jetbrains.skia.ColorSpace
import org.jetbrains.skia.ColorSpace.Companion.sRGB
import org.jetbrains.skia.Image
import org.jetbrains.skia.ImageInfo

fun ByteArray.toImage(
  width: Int,
  height: Int,
  alphaType: ColorAlphaType = PREMUL,
  colorSpace: ColorSpace = sRGB,
): Image = Image.makeRaster(ImageInfo.makeN32(width, height, alphaType, colorSpace), this, width * 4)

fun ByteArray.toImageBitmap(
  width: Int,
  height: Int,
  alphaType: ColorAlphaType = PREMUL,
  colorSpace: ColorSpace = sRGB,
): ImageBitmap = toImage(width, height, alphaType, colorSpace).toComposeImageBitmap()
