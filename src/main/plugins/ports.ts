import { ipcMain } from 'electron'
import { memo } from 'radash'
import { SerialPort } from 'serialport'
import { ipcProxy } from '../utilities'
import type { PortApi } from '../../preload/api'

const usePorts = memo(() => {
  ipcMain.handle('ports:list', ipcProxy(SerialPort.list))

  return {
    list: SerialPort.list
  } satisfies PortApi
})

export default usePorts
