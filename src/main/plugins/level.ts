import { ipcMain } from 'electron'
import useLevelDown from '@main/system/level'
import { ipcProxy } from '@main/utilities'

const useLevelDownPlugin = () => {
  const level = useLevelDown()

  ipcMain.handle('leveldb:connect', ipcProxy(level.connect))
  ipcMain.handle('leveldb:open', ipcProxy(level.open))
  ipcMain.handle('leveldb:close', ipcProxy(level.close))
  ipcMain.handle('leveldb:get', ipcProxy(level.get))
  ipcMain.handle('leveldb:getMany', ipcProxy(level.getMany))
  ipcMain.handle('leveldb:put', ipcProxy(level.put))
  ipcMain.handle('leveldb:del', ipcProxy(level.del))
  ipcMain.handle('leveldb:batch', ipcProxy(level.batch))
  ipcMain.handle('leveldb:clear', ipcProxy(level.clear))
  ipcMain.handle('leveldb:approximateSize', ipcProxy(level.approximateSize))
  ipcMain.handle('leveldb:compactRange', ipcProxy(level.compactRange))
  ipcMain.handle('leveldb:iterator', ipcProxy(level.iterator))
  ipcMain.handle('leveldb:iterator:next', ipcProxy(level.iteration.next))
  ipcMain.handle('leveldb:iterator:end', ipcProxy(level.iteration.end))
  ipcMain.handle('leveldb:iterator:seek', ipcProxy(level.iteration.seek))
}

export default useLevelDownPlugin
