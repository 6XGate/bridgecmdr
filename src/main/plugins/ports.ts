import { ipcMain } from 'electron'
import useSerialPorts from '@main/system/ports'
import { ipcProxy } from '@main/utilities'

const useSerialPortsPlugin = () => {
  const ports = useSerialPorts()

  ipcMain.handle('ports:list', ipcProxy(ports.list))
}

export default useSerialPortsPlugin
