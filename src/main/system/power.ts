import useDBus from '@main/helpers/dbus'

const useSystemInteraction = () => {
  const { dbusBind } = useDBus()

  /**
   * @param {boolean} interactive
   */
  const powerOff = dbusBind('--system', 'org.freedesktop.login1', '/org/freedesktop/login1',
    'org.freedesktop.login1.Manager', 'PowerOff', ['boolean'])

  return {
    powerOff
  }
}

export default useSystemInteraction
