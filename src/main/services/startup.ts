import { unlink as deleteFile, mkdir, stat, writeFile, readFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import { resolve as resolvePath, join as joinPath } from 'node:path'
import { app } from 'electron'
import Logger from 'electron-log'
import * as INI from 'ini'
import { memo } from 'radash'
import { xdgConfig } from 'xdg-basedir'
import { DesktopEntryFile, readyEntry } from './desktop'

const useStartup = memo(function useStartup() {
  const configPath = xdgConfig != null ? resolvePath(xdgConfig) : resolvePath(homedir(), '.config')

  const autoStartDir = joinPath(configPath, 'autostart')
  const autoStartFile = 'org.sleepingcats.BridgeCmdr.desktop'
  const autoStartPath = joinPath(autoStartDir, autoStartFile)
  const exePath = process.env['APPIMAGE'] ?? app.getPath('exe')

  /** Checks if the auto-start entry is enabled. */
  async function checkEnabled() {
    return await stat(autoStartPath)
      .then((s) => s.isFile())
      .catch(() => false)
  }

  /** Enables the auto-start entry. */
  async function enable() {
    await mkdir(autoStartDir, { recursive: true })

    const entry: DesktopEntryFile = {
      'Desktop Entry': {
        Type: 'Application',
        Name: 'BridgeCmdr',
        Exec: exePath,
        NoDisplay: true,
        Terminal: false
      }
    }

    await writeFile(autoStartPath, INI.stringify(readyEntry(entry)), { encoding: 'utf-8', mode: 0o644, flag: 'w' })
  }

  /** Disables the auto-start entry. */
  async function disable() {
    await deleteFile(autoStartPath)
  }

  /** Ensure that the file is valid and still points to the right location. */
  async function checkUp() {
    const enabled = await checkEnabled()
    if (!enabled) {
      Logger.debug('No auto-start entry; auto-start disabled, so skipping entry check')

      return
    }

    let reenable = false
    try {
      const file = DesktopEntryFile.parse(INI.parse(await readFile(autoStartPath, { encoding: 'utf-8' })))
      const entry = file['Desktop Entry']
      if (entry.Type !== 'Application' || entry.Exec !== exePath) {
        // Rewrite the entry to fix the type of path.
        reenable = true
      }
    } catch (e) {
      Logger.error(`Entry file parse error, rewriting: ${String(e)}`)
      reenable = true
    }

    if (reenable) {
      await enable()
    }
  }

  return {
    checkEnabled,
    checkUp,
    enable,
    disable
  }
})

export default useStartup
