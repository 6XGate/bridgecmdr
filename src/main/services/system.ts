import Logger from 'electron-log'
import { execa } from 'execa'
import { memo } from 'radash'

const useSystem = memo(function useSystem() {
  async function powerOff(interactive = false) {
    const args = interactive ? ['boolean:true'] : ['boolean:false']
    const params = [
      '--system',
      '--print-reply',
      '--dest=org.freedesktop.login1',
      '/org/freedesktop/login1',
      'org.freedesktop.login1.Manager.PowerOff',
      ...args
    ]

    Logger.debug('execa:dbus-send:params', ...params)
    const { stdout, stderr, exitCode } = await execa('dbus-send', params)
    if (exitCode !== 0) {
      throw new Error(stderr)
    }

    if (stdout) {
      Logger.debug('execa:dbus-send:output', stdout)
    }
  }

  return {
    powerOff
  }
})

export default useSystem
