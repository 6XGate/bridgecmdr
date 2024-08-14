import { ipcMain } from 'electron'
import { memo } from 'radash'
import useDbus from '../helpers/dbus'
import { ipcProxy } from '../utilities'
import type { SystemApi } from '../../preload/api'

const useSystem = memo(() => {
  const { dbusBind } = useDbus()

  const powerOffByDbus = dbusBind(
    '--system',
    'org.freedesktop.login1',
    '/org/freedesktop/login1',
    'org.freedesktop.login1.Manager',
    'PowerOff',
    ['boolean']
  )

  async function powerOff(interactive = false) {
    await powerOffByDbus(interactive)
  }

  ipcMain.handle('system:powerOff', ipcProxy(powerOff))

  return {
    powerOff
  } satisfies SystemApi
})

export default useSystem
