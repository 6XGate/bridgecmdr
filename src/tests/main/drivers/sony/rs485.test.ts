import { beforeAll, beforeEach, expect, test, vi } from 'vitest'
import type useDriversFn from '../../../../main/services/drivers'
import type { MockStreamContext } from '../../../support/stream'

const mock = await vi.hoisted(async () => await import('../../../support/mock'))
const port = await vi.hoisted(async () => await import('../../../support/serial'))
const stream = await vi.hoisted(async () => await import('../../../support/stream'))

let context: MockStreamContext
beforeAll(() => {
  vi.mock('electron-log')
  vi.mock('serialport', port.serialPortModule)

  // HACK: Force it, since we will stream in beforeEach
  context = {} as MockStreamContext
  vi.doMock('../../../../main/services/stream', stream.commandStreamModule(context))
})

let drivers: ReturnType<typeof useDriversFn>
beforeEach(async () => {
  mock.console()
  context.stream = new stream.MockCommandStream()
  drivers = (await import('../../../../main/services/drivers')).default()
})

const kDriverGuid = '8626D6D3-C211-4D21-B5CC-F5E3B50D9FF0'

test('available', async () => {
  const { default: driver } = await import('../../../../main/drivers/sony/rs485')

  await expect(drivers.registered()).resolves.toContainEqual(driver)
  await expect(drivers.allInfo()).resolves.toContainEqual(driver.metadata)
  await expect(drivers.get(kDriverGuid)).resolves.toStrictEqual(driver)
  const { capabilities, enabled, experimental, guid, kind } = driver.metadata
  expect(driver.getInfo('en')).toStrictEqual({
    ...driver.metadata.localized.en,
    capabilities,
    enabled,
    experimental,
    guid,
    kind
  })
})

test('power on', async () => {
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

test('power off', async () => {
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

test('activate tie', async () => {
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
