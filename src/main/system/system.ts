import { open } from 'node:fs/promises'
import { BrowserWindow, dialog, ipcMain } from 'electron'
import mime from 'mime'
import { memo } from 'radash'
import useDbus from '../helpers/dbus'
import { ipcHandle, ipcProxy } from '../utilities'
import type { SystemApi } from '../../preload/api'
import type { FileData } from '@/struct'
import type { OpenDialogOptions } from 'electron'
import { raiseError } from '@/error-handling'

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

  const showOpenDialog = ipcHandle(async (ev, options: OpenDialogOptions) => {
    const result = await dialog.showOpenDialog(
      BrowserWindow.fromWebContents(ev.sender) ?? raiseError(() => new ReferenceError('Invalid window')),
      options
    )

    if (result.canceled) {
      return null
    }

    return await Promise.all(
      result.filePaths.map(async (path) => {
        await using file = await open(path, 'r')
        const buffer = await file.readFile()
        const type = mime.getType(path) ?? 'application/octet-stream'
        return { path, buffer, type } satisfies FileData
      })
    )
  })

  ipcMain.handle('system:powerOff', ipcProxy(powerOff))
  ipcMain.handle('system:showOpenDialog', showOpenDialog)

  return {
    powerOff
  } satisfies Omit<SystemApi, 'showOpenDialog'>
})

export default useSystem
