import { ipcMain } from 'electron'
import { ipcProxy } from '@main/utilities'
import useSystemInteraction from '../system/power'

const useSystemPlugin = () => {
  const { powerOff } = useSystemInteraction()

  ipcMain.handle('system:powerOff', ipcProxy(async () => { await powerOff(false) }))
}

export default useSystemPlugin
