import { ipcMain } from 'electron'
import { memo } from 'radash'
import { SerialPort } from 'serialport'
import { ipcProxy } from '../utilities.js'
import type { PortApi } from '../../preload/api.js'

const usePorts = memo(() => {
  ipcMain.handle('ports:list', ipcProxy(SerialPort.list))

  return {
    list: SerialPort.list
  } satisfies PortApi
})

export default usePorts
