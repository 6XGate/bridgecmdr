import { ipcMain } from 'electron'
import { useDrivers } from '@main/system/driver'
import { getDefault, ipcProxy } from '@main/utilities'

const useDriverPlugin = async () => {
  const drivers = useDrivers()

  ipcMain.handle('driver:list', ipcProxy(drivers.list))
  ipcMain.handle('driver:open', ipcProxy(drivers.open))
  ipcMain.handle('driver:close', ipcProxy(drivers.close))
  ipcMain.handle('driver:powerOn', ipcProxy(drivers.powerOn))
  ipcMain.handle('driver:powerOff', ipcProxy(drivers.powerOff))
  ipcMain.handle('driver:activate', ipcProxy(drivers.activate))

  drivers.register(getDefault(await import('@main/drivers/extron/sis')))
  drivers.register(getDefault(await import('@main/drivers/sony/rs485')))
  drivers.register(getDefault(await import('@main/drivers/tesla-smart/matrix')))
  drivers.register(getDefault(await import('@main/drivers/tesla-smart/sdi')))
}

export default useDriverPlugin
