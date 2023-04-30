import { unlink as deleteFile, mkdir, open as openFile, stat } from 'node:fs/promises'
import { homedir } from 'node:os'
import { resolve as resolvePath, join as joinPath } from 'node:path'
import xdgBasedir from 'xdg-basedir'
import type { StartupApi } from '@preload/api'

export const useAutoStart = () => {
  const configPath = xdgBasedir.config != null
    ? resolvePath(xdgBasedir.config)
    : resolvePath(homedir(), '.config')

  const autoStartDir = joinPath(configPath, 'autostart')
  const autoStartFile = 'org.sleepingcats.BridgeCmdr.desktop'
  const autoStartPath = joinPath(autoStartDir, autoStartFile)

  const checkEnabled = async () =>
    await stat(autoStartPath)
      .then(s => s.isFile()).catch(() => false)

  const enable = async () => {
    await mkdir(autoStartDir, { recursive: true })
    const needsExecProxy = process.execPath.endsWith('electron')
    const exec = needsExecProxy
      // FIXME: Shouldn't need the bridgecmdr name...
      ? resolvePath(__dirname, '../../../bridgecmdr')
      : 'bridgecmdr'

    const entry = await openFile(autoStartPath, 'w', 0o644)
    await entry.write('[Desktop Entry]\n')
    await entry.write('Name=BridgeCmdr\n')
    await entry.write(`Exec=${exec}\n`)
    await entry.write('NoDisplay=true\n')
    await entry.write('Terminal=false\n')
    await entry.close()
  }

  const disable = async () => {
    await deleteFile(autoStartPath)
  }

  return {
    checkEnabled,
    enable,
    disable
  } satisfies StartupApi
}
