import { afterEach, describe, expect, test, vi } from 'vitest'

afterEach(() => {
  vi.restoreAllMocks()
  vi.resetModules()
})

test('no ports', async () => {
  const { SerialPort } = await import('serialport')
  vi.spyOn(SerialPort, 'list').mockResolvedValue([])
  const { default: useSerialPorts } = await import('../../main/services/ports')
  const ports = await useSerialPorts().listPorts()
  expect(ports).toStrictEqual([])
})

test('list simple ports', async () => {
  const { SerialPort } = await import('serialport')
  vi.spyOn(SerialPort, 'list').mockResolvedValue([
    {
      locationId: undefined,
      manufacturer: 'Mock Serial Port',
      path: '/dev/ttyS0',
      pnpId: undefined,
      productId: '8087',
      serialNumber: '1',
      vendorId: '8086'
    },
    {
      locationId: undefined,
      manufacturer: 'Mock Serial Port',
      path: '/dev/ttyS1',
      pnpId: undefined,
      serialNumber: '2',
      productId: '8087',
      vendorId: '8086'
    },
    {
      locationId: undefined,
      manufacturer: 'Mock Serial Port',
      pnpId: undefined,
      serialNumber: '3',
      path: '/dev/ttyS2',
      productId: '8087',
      vendorId: '8086'
    }
  ])

  const { default: useSerialPorts } = await import('../../main/services/ports')
  const ports = await useSerialPorts().listPorts()
  expect(ports).toStrictEqual([
    {
      locationId: undefined,
      manufacturer: 'Mock Serial Port',
      path: '/dev/ttyS0',
      pnpId: undefined,
      productId: '8087',
      serialNumber: '1',
      title: 'Mock Serial Port',
      vendorId: '8086'
    },
    {
      locationId: undefined,
      manufacturer: 'Mock Serial Port',
      path: '/dev/ttyS1',
      pnpId: undefined,
      serialNumber: '2',
      productId: '8087',
      title: 'Mock Serial Port',
      vendorId: '8086'
    },
    {
      locationId: undefined,
      manufacturer: 'Mock Serial Port',
      pnpId: undefined,
      serialNumber: '3',
      path: '/dev/ttyS2',
      productId: '8087',
      title: 'Mock Serial Port',
      vendorId: '8086'
    }
  ])
})

describe('parsing PnP ID', () => {
  test('USB PnP ID ports', async () => {
    const { SerialPort } = await import('serialport')
    vi.spyOn(SerialPort, 'list').mockResolvedValue([
      {
        manufacturer: 'FTDI',
        serialNumber: 'XXXXXXXX',
        pnpId: 'usb-FTDI_FT232R_USB_UART_XXXXXXXX-if00-port0',
        locationId: undefined,
        vendorId: '0403',
        productId: '6001',
        path: '/dev/ttyUSB0'
      },
      {
        manufacturer: 'FTDI',
        serialNumber: 'XXXXXXXX',
        pnpId: 'usb-FTDI_FT232R_USB_UART_XXXXXXXX-if00',
        locationId: undefined,
        vendorId: '0403',
        productId: '6001',
        path: '/dev/ttyUSB1'
      },
      {
        manufacturer: 'FTDI',
        serialNumber: 'XXXXXXXX',
        pnpId: 'usb-FTDI_FT232R_USB_UART_XXXXXXXX-port0',
        locationId: undefined,
        vendorId: '0403',
        productId: '6001',
        path: '/dev/ttyUSB2'
      }
    ])

    const { default: useSerialPorts } = await import('../../main/services/ports')
    const ports = await useSerialPorts().listPorts()
    expect(ports).toStrictEqual([
      {
        locationId: undefined,
        manufacturer: 'FTDI',
        path: '/dev/ttyUSB0',
        pnpId: 'usb-FTDI_FT232R_USB_UART_XXXXXXXX-if00-port0',
        productId: '6001',
        serialNumber: 'XXXXXXXX',
        title: 'FTDI FT232R USB UART XXXXXXXX',
        vendorId: '0403'
      },
      {
        locationId: undefined,
        manufacturer: 'FTDI',
        path: '/dev/ttyUSB1',
        pnpId: 'usb-FTDI_FT232R_USB_UART_XXXXXXXX-if00',
        productId: '6001',
        serialNumber: 'XXXXXXXX',
        title: 'FTDI FT232R USB UART XXXXXXXX',
        vendorId: '0403'
      },
      {
        locationId: undefined,
        manufacturer: 'FTDI',
        path: '/dev/ttyUSB2',
        pnpId: 'usb-FTDI_FT232R_USB_UART_XXXXXXXX-port0',
        productId: '6001',
        serialNumber: 'XXXXXXXX',
        title: 'FTDI FT232R USB UART XXXXXXXX',
        vendorId: '0403'
      }
    ])
  })

  test('Unknown PnP ID ports', async () => {
    const { SerialPort } = await import('serialport')
    vi.spyOn(SerialPort, 'list').mockResolvedValue([
      // Missing port and interface.
      {
        manufacturer: 'FTDI',
        serialNumber: 'XXXXXXXX',
        pnpId: 'usb-FTDI_FT232R_USB_UART_XXXXXXXX',
        locationId: undefined,
        vendorId: '0403',
        productId: '6001',
        path: '/dev/ttyUSB0'
      },
      // Missing bus.
      {
        manufacturer: 'FTDI',
        serialNumber: 'XXXXXXXX',
        pnpId: 'FTDI_FT232R_USB_UART_XXXXXXXX-if00-port0',
        locationId: undefined,
        vendorId: '0403',
        productId: '6001',
        path: '/dev/ttyUSB1'
      },
      // Missing bus, port, and interface.
      {
        manufacturer: 'FTDI',
        serialNumber: 'XXXXXXXX',
        pnpId: 'FTDI_FT232R_USB_UART_XXXXXXXX',
        locationId: undefined,
        vendorId: '0403',
        productId: '6001',
        path: '/dev/ttyUSB2'
      },
      // Missing a lot.
      {
        manufacturer: 'FTDI',
        serialNumber: 'XXXXXXXX',
        pnpId: 'if00-port0-port1',
        locationId: undefined,
        vendorId: '0403',
        productId: '6001',
        path: '/dev/ttyUSB3'
      }
    ])

    const { default: useSerialPorts } = await import('../../main/services/ports')
    const ports = await useSerialPorts().listPorts()
    expect(ports).toStrictEqual([
      {
        locationId: undefined,
        manufacturer: 'FTDI',
        path: '/dev/ttyUSB0',
        pnpId: 'usb-FTDI_FT232R_USB_UART_XXXXXXXX',
        productId: '6001',
        serialNumber: 'XXXXXXXX',
        title: 'FTDI',
        vendorId: '0403'
      },
      {
        locationId: undefined,
        manufacturer: 'FTDI',
        path: '/dev/ttyUSB1',
        pnpId: 'FTDI_FT232R_USB_UART_XXXXXXXX-if00-port0',
        productId: '6001',
        serialNumber: 'XXXXXXXX',
        title: 'FTDI',
        vendorId: '0403'
      },
      {
        locationId: undefined,
        manufacturer: 'FTDI',
        path: '/dev/ttyUSB2',
        pnpId: 'FTDI_FT232R_USB_UART_XXXXXXXX',
        productId: '6001',
        serialNumber: 'XXXXXXXX',
        title: 'FTDI',
        vendorId: '0403'
      },
      {
        locationId: undefined,
        manufacturer: 'FTDI',
        path: '/dev/ttyUSB3',
        pnpId: 'if00-port0-port1',
        productId: '6001',
        serialNumber: 'XXXXXXXX',
        title: 'FTDI',
        vendorId: '0403'
      }
    ])
  })
})
