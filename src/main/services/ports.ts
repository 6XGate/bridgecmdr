import is from '@sindresorhus/is'
import { memo } from 'radash'
import { SerialPort } from 'serialport'

// HACK: Workaround legacy TypeDefinition from serialport PortInfo.
export interface PortInfo {
  path: string
  manufacturer: string | undefined
  serialNumber: string | undefined
  pnpId: string | undefined
  locationId: string | undefined
  productId: string | undefined
  vendorId: string | undefined
}

export interface PortEntry extends PortInfo {
  title: string
}

type BadPnpId = typeof BadPnpId
const BadPnpId = Symbol('UsePath')

const useSerialPorts = memo(function useSerialPorts() {
  // TODO: Determine a way to test the title caching.

  const titled = new Map<string, BadPnpId | string>()

  function getPortTitle(info: PortInfo) {
    const { manufacturer, pnpId, path } = info

    if (!is.nonEmptyStringAndNotWhitespace(pnpId)) {
      // If there is no pnpId; don't cache the name,
      // it's less costly by avoiding the map
      // lookup. We will still key on the
      // manufacturer for wierd PnP IDs.
      return is.nonEmptyStringAndNotWhitespace(manufacturer) ? manufacturer : path
    }

    let title = titled.get(pnpId)
    if (title === BadPnpId) {
      return is.nonEmptyStringAndNotWhitespace(manufacturer) ? manufacturer : path
    }

    if (title != null) return title

    // The PnP ID seems to be based on this format;
    // ${bus}-${snake_style_label}-${positions.join('-')},
    // where:
    // - bus: 'usb' | 'tty' | etc.
    // - snake_style_label: 'Friendly_name_in_snake_style'
    // - positions: Array<`port{number}` | `if{number}`>

    // First, split by hyphen, this should produce
    // the bus/label/position combo.
    let labelParts = pnpId.split('-')
    if (labelParts.length < 3) {
      titled.set(pnpId, BadPnpId)
      return is.nonEmptyStringAndNotWhitespace(manufacturer) ? manufacturer : path
    }

    // Pop any positions off the end.
    for (;;) {
      const part = labelParts.at(-1)
      if (part == null) {
        titled.set(pnpId, BadPnpId)
        return is.nonEmptyStringAndNotWhitespace(manufacturer) ? manufacturer : path
      }

      if (/^port\d+$/u.test(part)) {
        labelParts.pop()
      } else if (/^if\d+$/u.test(part)) {
        labelParts.pop()
      } else {
        break
      }
    }

    // Slice off the bus.
    labelParts = labelParts.slice(1)
    if (labelParts.length === 0) {
      titled.set(pnpId, BadPnpId)
      return is.nonEmptyStringAndNotWhitespace(manufacturer) ? manufacturer : path
    }

    // Now, rejoin the label by hypens, in case
    // those were in the friendly name, and
    // replace underscores with spaces.
    title = labelParts.join('-').replace(/_/gu, ' ')
    titled.set(pnpId, title)
    return title
  }

  async function listRawPorts() {
    return (await SerialPort.list()) as PortInfo[]
  }

  async function listPorts() {
    const ports = await listRawPorts()

    return ports.map(function parsePortInfo(port) {
      return {
        ...port,
        title: getPortTitle(port)
      }
    })
  }

  async function isValidPort(path: string) {
    const ports = await listRawPorts()
    return ports.find((port) => port.path === path) != null
  }

  return {
    listPorts,
    isValidPort
  }
})

export default useSerialPorts
