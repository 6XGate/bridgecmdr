package org.sleepingcats.bridgecmdr.common.service

interface PowerService {
  suspend fun powerOn()

  suspend fun powerOff()
}
