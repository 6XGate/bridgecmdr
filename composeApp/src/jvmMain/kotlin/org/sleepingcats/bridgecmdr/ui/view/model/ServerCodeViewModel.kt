package org.sleepingcats.bridgecmdr.ui.view.model

import androidx.compose.ui.graphics.ImageBitmap
import androidx.lifecycle.viewModelScope
import com.google.zxing.BarcodeFormat.QR_CODE
import com.google.zxing.EncodeHintType.MARGIN
import com.google.zxing.qrcode.QRCodeWriter
import io.github.oshai.kotlinlogging.KLogger
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.filterIsInstance
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.stateIn
import org.sleepingcats.bridgecmdr.common.ServerCode
import org.sleepingcats.bridgecmdr.common.extension.toImageBitmap
import org.sleepingcats.bridgecmdr.server.ServerController
import org.sleepingcats.bridgecmdr.server.ServerStatus
import org.sleepingcats.bridgecmdr.ui.view.model.core.TrackingViewModel

class ServerCodeViewModel(
  logger: KLogger,
  serverController: ServerController,
) : TrackingViewModel(logger) {
  data class State(
    val qrCode: ImageBitmap? = null,
  )

  private var qrCode =
    serverController.status
      .filterIsInstance<ServerStatus.Running>()
      .map { status -> ServerCode(status.url, status.tokenSecret, status.publicKey) }
      .map { code ->
        QRCodeWriter()
          .encode(code.qrCodeData, QR_CODE, 256, 256, mapOf(MARGIN to 1))
          .toImageBitmap()
      }

  val state = qrCode.map(::State).stateIn(viewModelScope, SharingStarted.Eagerly, State())
}
