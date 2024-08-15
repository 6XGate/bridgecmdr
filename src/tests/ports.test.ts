import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import type { PortInfo } from '../preload/api'

const mock = await vi.hoisted(async () => await import('./support/mock'))
const port = await vi.hoisted(async () => await import('./support/serial'))

interface PortContext {
  ports: PortInfo[]
}

beforeEach(async () => {
  vi.mock(import('electron'), mock.electronModule)
  vi.mock(import('electron-log'))
  vi.mock(import('serialport'), port.serialPortModule)
  await mock.bridgeCmdrBasics()
  await port.createMockPorts()
})

afterEach(async () => {
  await globalThis.services.freeAllHandles()
  await port.resetMockPorts()
  vi.resetModules()
})

test('list raw port', async () => {
  const ports = await globalThis.services.ports.list()
  expect(ports).toMatchObject([
    {
      path: '/dev/ttyS0',
      manufacturer: 'Mock Serial Port',
      vendorId: '8086',
      productId: '8087'
    },
    {
      path: '/dev/ttyS1',
      manufacturer: 'Mock Serial Port',
      vendorId: '8086',
      productId: '8087'
    },
    {
      path: '/dev/ttyS2',
      manufacturer: 'Mock Serial Port',
      vendorId: '8086',
      productId: '8087'
    }
  ])
})

test('list ports', async () => {
  const { default: usePorts } = await import('../renderer/system/ports')

  const ports = usePorts()
  await expect(ports.all()).resolves.toBeUndefined()
  expect(ports.items).toMatchObject([
    {
      title: '/dev/ttyS0',
      value: '/dev/ttyS0'
    },
    {
      title: '/dev/ttyS1',
      value: '/dev/ttyS1'
    },
    {
      title: '/dev/ttyS2',
      value: '/dev/ttyS2'
    }
  ])
})

describe('parsing port info', () => {
  beforeEach<PortContext>((context) => {
    context.ports = []
    vi.spyOn(globalThis.services.ports, 'list').mockImplementation(async () => await Promise.resolve(context.ports))
  })

  afterEach<PortContext>(() => {
    vi.restoreAllMocks()
  })

  test<PortContext>('no ports', async () => {
    const { default: usePorts } = await import('../renderer/system/ports')
    const ports = usePorts()
    await ports.all()
    expect(ports.items).toStrictEqual([])
  })

  test<PortContext>('USB PnP ID ports', async (context) => {
    context.ports = [
      {
        manufacturer: 'FTDI',
        serialNumber: 'XXXXXXXX',
        pnpId: 'usb-FTDI_FT232R_USB_UART_XXXXXXXX-if00-port0',
        locationId: undefined,
        vendorId: '0403',
        productId: '6001',
        path: '/dev/ttyUSB0'
      }
    ]

    const { default: usePorts } = await import('../renderer/system/ports')
    const ports = usePorts()
    await ports.all()
    expect(ports.items).toStrictEqual([
      {
        title: 'FTDI FT232R USB UART XXXXXXXX',
        value: '/dev/ttyUSB0'
      }
    ])
  })

  test<PortContext>('Unknown PnP ID ports', async (context) => {
    context.ports = [
      {
        manufacturer: 'FTDI',
        serialNumber: 'XXXXXXXX',
        pnpId: 'usb-FTDI_FT232R_USB_UART_XXXXXXXX',
        locationId: undefined,
        vendorId: '0403',
        productId: '6001',
        path: '/dev/ttyUSB0'
      },
      {
        manufacturer: 'FTDI',
        serialNumber: 'XXXXXXXX',
        pnpId: 'FTDI_FT232R_USB_UART_XXXXXXXX-if00-port0',
        locationId: undefined,
        vendorId: '0403',
        productId: '6001',
        path: '/dev/ttyUSB1'
      },
      {
        manufacturer: 'FTDI',
        serialNumber: 'XXXXXXXX',
        pnpId: 'FTDI_FT232R_USB_UART_XXXXXXXX',
        locationId: undefined,
        vendorId: '0403',
        productId: '6001',
        path: '/dev/ttyUSB2'
      },
      {
        manufacturer: 'FTDI',
        serialNumber: 'XXXXXXXX',
        pnpId: 'if00-port0-port1',
        locationId: undefined,
        vendorId: '0403',
        productId: '6001',
        path: '/dev/ttyUSB3'
      }
    ]

    const { default: usePorts } = await import('../renderer/system/ports')
    const ports = usePorts()
    await ports.all()
    expect(ports.items).toStrictEqual([
      {
        title: '/dev/ttyUSB0',
        value: '/dev/ttyUSB0'
      },
      {
        title: '/dev/ttyUSB1',
        value: '/dev/ttyUSB1'
      },
      {
        title: '/dev/ttyUSB2',
        value: '/dev/ttyUSB2'
      },
      {
        title: '/dev/ttyUSB3',
        value: '/dev/ttyUSB3'
      }
    ])
  })
})
