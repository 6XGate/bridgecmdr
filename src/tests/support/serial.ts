/* eslint-disable @typescript-eslint/consistent-type-imports -- Needed for module mocking. */

export async function serialPortModule(original: () => Promise<typeof import('serialport')>) {
  const serialport = await original()
  const { SerialPortMock } = serialport

  const kHardwareInfo = {
    manufacturer: 'Mock Serial Port',
    vendorId: '8086',
    productId: '8087'
  }

  /* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access -- Issue with serialport module. */
  SerialPortMock.binding.reset()
  SerialPortMock.binding.createPort('/dev/ttyS0', { echo: true, record: true, ...kHardwareInfo })
  SerialPortMock.binding.createPort('/dev/ttyS1', { echo: true, record: true, ...kHardwareInfo })
  SerialPortMock.binding.createPort('/dev/ttyS2', { echo: true, record: true, ...kHardwareInfo })
  /* eslint-enable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */

  return {
    ...serialport,
    SerialPort: serialport.SerialPortMock
  }
}
