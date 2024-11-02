import { memo } from 'radash'
import useDbus from './dbus'

const useSystem = memo(function useSystem() {
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

  return {
    powerOff
  }
})

export default useSystem
