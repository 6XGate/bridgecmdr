/* eslint-disable @typescript-eslint/consistent-type-imports -- Needed for module mocking. */

export async function serialPortModule(original: () => Promise<typeof import('serialport')>) {
  const serialport = await original()

  return {
    ...serialport,
    SerialPort: serialport.SerialPortMock
  }
}

export async function createMockPorts() {
  const { SerialPortMock } = await import('serialport')

  const kHardwareInfo = {
    manufacturer: 'Mock Serial Port',
    vendorId: '8086',
    productId: '8087'
  }
  SerialPortMock.binding.createPort('/dev/ttyS0', { echo: true, record: true, ...kHardwareInfo })
  SerialPortMock.binding.createPort('/dev/ttyS1', { echo: true, record: true, ...kHardwareInfo })
  SerialPortMock.binding.createPort('/dev/ttyS2', { echo: true, record: true, ...kHardwareInfo })

  const { default: usePorts } = await import('../../main/plugins/ports.js')

  usePorts()
}

export async function resetMockPorts() {
  const { SerialPortMock } = await import('serialport')
  SerialPortMock.binding.reset()
}
