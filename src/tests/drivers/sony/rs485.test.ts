import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import type { MockStreamContext } from '../../support/stream'

const mock = await vi.hoisted(async () => await import('../../support/mock'))
const port = await vi.hoisted(async () => await import('../../support/serial'))
const stream = await vi.hoisted(async () => await import('../../support/stream'))

beforeEach<MockStreamContext>(async (context) => {
  vi.mock(import('electron'), mock.electronModule)
  vi.mock(import('electron-log'))
  vi.mock(import('serialport'), port.serialPortModule)
  vi.doMock(import('../../../main/helpers/stream'), stream.commandStreamModule(context))
  await mock.bridgeCmdrBasics()
  await port.createMockPorts()
  const { default: useDrivers } = await import('../../../main/system/driver')
  const { default: registerDrivers } = await import('../../../main/plugins/drivers')
  useDrivers()
  registerDrivers()
})

afterEach(async () => {
  await globalThis.api.freeAllHandles()
  await port.resetMockPorts()
  vi.resetModules()
})

const kDriverGuid = '8626D6D3-C211-4D21-B5CC-F5E3B50D9FF0'

test('available', async () => {
  const { kDeviceHasNoExtraCapabilities } = await import('../../../main/system/driver')

  // Raw list.
  await expect(globalThis.api.driver.list()).resolves.toContainEqual({
    enable: true,
    guid: kDriverGuid,
    localized: {
      en: {
        title: 'Sony RS-485 controllable monitor',
        company: 'Sony Corporation',
        provider: 'BridgeCmdr contributors'
      }
    },
    capabilities: kDeviceHasNoExtraCapabilities
  })

  // Localized list.
  const { useDrivers } = await import('../../../renderer/system/driver')
  const drivers = useDrivers()
  await expect(drivers.all()).resolves.toBeUndefined()
  expect(drivers.items).toContainEqual({
    guid: kDriverGuid,
    title: 'Sony RS-485 controllable monitor',
    company: 'Sony Corporation',
    provider: 'BridgeCmdr contributors',
    capabilities: kDeviceHasNoExtraCapabilities
  })
})

test('connect', async () => {
  const { useDrivers } = await import('../../../renderer/system/driver')
  const { load } = useDrivers()

  await expect(load(kDriverGuid, 'port:/dev/ttyS0')).resolves.not.toBeNull()
})

test<MockStreamContext>('power on', async (context) => {
  mock.console()

  context.stream = new stream.MockCommandStream()

  const { useDrivers } = await import('../../../renderer/system/driver')
  const { load } = useDrivers()

  const command = Buffer.of(0x02, 4, 0xc0, 0xc0, 0x29, 0x3e, 0x15)
  // Packet type: Command == 0x02
  // Packet contents length: 4
  // Command packet:
  //   Destination: All monitors == 0xc0 OR Address == 0; => 0xc0
  //   Source: All monitors == 0xc0 OR Address == 0; => 0xc0
  //   Command: PowerOn == 0x293e (in BE)
  // Checksum: 0x15

  context.stream.withSequence().on(command, () => Buffer.from('Good'))

  const driver = await load(kDriverGuid, 'port:/dev/ttyS0')
  await expect(driver.powerOn()).resolves.toBeUndefined()
  context.stream.sequence.expectDone()
})

test<MockStreamContext>('power off', async (context) => {
  mock.console()

  context.stream = new stream.MockCommandStream()

  const { useDrivers } = await import('../../../renderer/system/driver')
  const { load } = useDrivers()

  const commnad = Buffer.of(0x02, 4, 0xc0, 0xc0, 0x2a, 0x3e, 0x14)
  // Packet type: Command == 0x02
  // Packet contents length: 4
  // Command packet:
  //   Destination: All monitors == 0xc0 OR Address == 0; => 0xc0
  //   Source: All monitors == 0xc0 OR Address == 0; => 0xc0
  //   Command: PowerOff == 0x2a3e (in BE)
  // Checksum: 0x14

  context.stream.withSequence().on(commnad, () => Buffer.from('Good'))

  const driver = await load(kDriverGuid, 'port:/dev/ttyS0')
  await expect(driver.powerOff()).resolves.toBeUndefined()
  context.stream.sequence.expectDone()
})

test<MockStreamContext>('activate tie', async (context) => {
  mock.console()

  context.stream = new stream.MockCommandStream()

  const { useDrivers } = await import('../../../renderer/system/driver')
  const { load } = useDrivers()

  const input = 1
  const command = Buffer.of(0x02, 6, 0xc0, 0xc0, 0x21, 0x00, input, 0x01, 0x57)
  // Packet type: Command == 0x02
  // Packet contents length: 4
  // Command packet:
  //   Destination: All monitors == 0xc0 OR Address == 0; => 0xc0
  //   Source: All monitors == 0xc0 OR Address == 0; => 0xc0
  //   Command: Set Channel == 0x2100 (in BE)
  //   Channel: 1
  //   Unknown: Always 0x01
  // Checksum: 0x57

  context.stream.withSequence().on(command, () => Buffer.from('Good'))

  const driver = await load(kDriverGuid, 'port:/dev/ttyS0')
  await expect(driver.activate(input, 0, 0)).resolves.toBeUndefined()
  context.stream.sequence.expectDone()
})
