import { ipcMain } from 'electron'
import { useAutoStart } from '@main/system/startup'
import { ipcProxy } from '@main/utilities'

const useAutoStartPlugin = () => {
  const autoStart = useAutoStart()

  ipcMain.handle('startup:checkEnabled', ipcProxy(autoStart.checkEnabled))
  ipcMain.handle('startup:enable', ipcProxy(autoStart.enable))
  ipcMain.handle('startup:disable', ipcProxy(autoStart.disable))
}

export default useAutoStartPlugin
