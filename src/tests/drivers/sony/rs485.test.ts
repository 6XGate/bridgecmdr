import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import type { MockStreamContext } from '../../support/stream'

const mock = await vi.hoisted(async () => await import('../../support/mock'))
const port = await vi.hoisted(async () => await import('../../support/serial'))
const stream = await vi.hoisted(async () => await import('../../support/stream'))

beforeEach<MockStreamContext>(async (context) => {
  vi.mock('electron-log')
  vi.mock('serialport', port.serialPortModule)
  vi.doMock('../../../main/services/stream', stream.commandStreamModule(context))
  await port.createMockPorts()
})

afterEach(async () => {
  await port.resetMockPorts()
  vi.restoreAllMocks()
  vi.resetModules()
})

const kDriverGuid = '8626D6D3-C211-4D21-B5CC-F5E3B50D9FF0'

test('available', async () => {
  const { default: driver } = await import('../../../main/drivers/sony/rs485')
  const { default: useDrivers } = await import('../../../main/services/drivers')

  const drivers = useDrivers()

  await expect(drivers.all()).resolves.toContainEqual(driver)
  await expect(drivers.get(kDriverGuid)).resolves.toEqual(driver)
})

test<MockStreamContext>('power on', async (context) => {
  mock.console()

  context.stream = new stream.MockCommandStream()

  const { default: useDrivers } = await import('../../../main/services/drivers')
  const drivers = useDrivers()

  const command = Buffer.of(0x02, 4, 0xc0, 0xc0, 0x29, 0x3e, 0x15)
  // Packet type: Command == 0x02
  // Packet contents length: 4
  // Command packet:
  //   Destination: All monitors == 0xc0 OR Address == 0; => 0xc0
  //   Source: All monitors == 0xc0 OR Address == 0; => 0xc0
  //   Command: PowerOn == 0x293e (in BE)
  // Checksum: 0x15

  context.stream.withSequence().on(command, () => Buffer.from('Good'))

  await expect(drivers.powerOn(kDriverGuid, 'port:/dev/ttyS0')).resolves.toBeUndefined()
  context.stream.sequence.expectDone()
})

test<MockStreamContext>('power off', async (context) => {
  mock.console()

  context.stream = new stream.MockCommandStream()

  const { default: useDrivers } = await import('../../../main/services/drivers')
  const drivers = useDrivers()

  const commnad = Buffer.of(0x02, 4, 0xc0, 0xc0, 0x2a, 0x3e, 0x14)
  // Packet type: Command == 0x02
  // Packet contents length: 4
  // Command packet:
  //   Destination: All monitors == 0xc0 OR Address == 0; => 0xc0
  //   Source: All monitors == 0xc0 OR Address == 0; => 0xc0
  //   Command: PowerOff == 0x2a3e (in BE)
  // Checksum: 0x14

  context.stream.withSequence().on(commnad, () => Buffer.from('Good'))

  await expect(drivers.powerOff(kDriverGuid, 'port:/dev/ttyS0')).resolves.toBeUndefined()
  context.stream.sequence.expectDone()
})

test<MockStreamContext>('activate tie', async (context) => {
  mock.console()

  context.stream = new stream.MockCommandStream()

  const { default: useDrivers } = await import('../../../main/services/drivers')
  const drivers = useDrivers()

  const input = 1
  const command = Buffer.of(0x02, 6, 0xc0, 0xc0, 0x21, 0x00, input, 0x01, 0x57)
  // Packet type: Command == 0x02
  // Packet contents length: 6
  // Command packet:
  //   Destination: All monitors == 0xc0 OR Address == 0; => 0xc0
  //   Source: All monitors == 0xc0 OR Address == 0; => 0xc0
  //   Command: Set Channel == 0x2100 (in BE)
  //   Channel: 1
  //   Unknown: Always 0x01
  // Checksum: 0x57

  context.stream.withSequence().on(command, () => Buffer.from('Good'))

  await expect(drivers.activate(kDriverGuid, 'port:/dev/ttyS0', input, 0, 0)).resolves.toBeUndefined()
  context.stream.sequence.expectDone()
})
