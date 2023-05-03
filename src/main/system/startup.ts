import { unlink as deleteFile, mkdir, stat, writeFile, readFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import { resolve as resolvePath, join as joinPath } from 'node:path'
import { app } from 'electron'
import log from 'electron-log'
import * as INI from 'ini'
import xdgBasedir from 'xdg-basedir'
import { DesktopEntryFile, readyEntry } from '@main/support/desktop'
import type { StartupApi } from '@preload/api'

export const useAutoStart = () => {
  const configPath = xdgBasedir.config != null
    ? resolvePath(xdgBasedir.config)
    : resolvePath(homedir(), '.config')

  const autoStartDir = joinPath(configPath, 'autostart')
  const autoStartFile = 'org.sleepingcats.BridgeCmdr.desktop'
  const autoStartPath = joinPath(autoStartDir, autoStartFile)
  const execPath = app.getPath('exe')

  const checkEnabled = async () =>
    await stat(autoStartPath)
      .then(s => s.isFile()).catch(() => false)

  const enable = async () => {
    await mkdir(autoStartDir, { recursive: true })

    const entry: DesktopEntryFile = {
      'Desktop Entry': {
        Type: 'Application',
        Name: 'BridgeCmdr',
        Exec: execPath,
        NoDisplay: true,
        Terminal: false
      }
    }

    await writeFile(autoStartPath, INI.stringify(readyEntry(entry)),
      { encoding: 'utf-8', mode: 0o644, flag: 'w' })
  }

  const disable = async () => {
    await deleteFile(autoStartPath)
  }

  // Ensure that the file is valid and still points to the right location.
  const checkUp = async () => {
    const enabled = await checkEnabled()
    if (!enabled) {
      log.debug('No auto-start entry; auto-start disabled, so skipping entry check')

      return
    }

    let reenable = false
    try {
      const file = DesktopEntryFile.parse(INI.parse(await readFile(autoStartPath,
        { encoding: 'utf-8' })))
      const entry = file['Desktop Entry']
      if (entry.Type !== 'Application' || entry.Exec !== execPath) {
        // Rewrite the entry to fix the type of path.
        reenable = true
      }
    } catch (e) {
      log.error(`Entry file parse error, rewriting: ${String(e)}`)
      reenable = true
    }

    if (reenable) {
      await enable()
    }
  }

  checkUp().catch(e => { log.error(e) })

  return {
    checkEnabled,
    enable,
    disable
  } satisfies StartupApi
}
