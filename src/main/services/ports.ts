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
  value: string
}

const useSerialPorts = memo(() => ({
  list: async () => {
    const ports = (await SerialPort.list()) as PortInfo[]

    return ports.map(function parsePortInfo(port) {
      // If there is no PnP ID, then just use the path.
      if (!is.nonEmptyString(port.pnpId)) {
        return {
          ...port,
          title: port.path,
          value: port.path
        }
      }

      // The PnP ID seems to be based on this format;
      // ${bus}-${snake_style_label}-${positions.join('-')},
      // where:
      // - bus: 'usb' | 'tty' | etc.
      // - snake_style_label: 'Friendly_name_in_snake_style'
      // - positions: Array<`port{number}` | `if{number}`>

      // First, split by hyphen, this should produce
      // the bus/label/position combo.
      let labelParts = port.pnpId.split('-')
      if (labelParts.length < 3) {
        return {
          ...port,
          title: port.path,
          value: port.path
        }
      }

      // Pop any positions off the end.
      for (;;) {
        const part = labelParts.at(-1)
        if (part == null) {
          return {
            ...port,
            title: port.path,
            value: port.path
          }
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
        return {
          ...port,
          title: port.path,
          value: port.path
        }
      }

      // Now, rejoin the label by hypens, in case
      // those were in the friendly name, and
      // replace underscores with spaces.
      return {
        ...port,
        title: labelParts.join('-').replace(/_/gu, ' '),
        value: port.path
      }
    })
  }
}))

export default useSerialPorts
