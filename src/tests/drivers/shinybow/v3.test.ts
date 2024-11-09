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

const kDriverGuid = 'BBED08A1-C749-4733-8F2E-96C9B56C0C41'

test('available', async () => {
  const { default: driver } = await import('../../../main/drivers/shinybow/v3')
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

  const command = `POWER 001;\r\n`

  context.stream.withSequence().on(Buffer.from(command), () => Buffer.from('Good'))

  await expect(drivers.powerOn(kDriverGuid, 'port:/dev/ttyS0')).resolves.toBeUndefined()
  context.stream.sequence.expectDone()
})

test<MockStreamContext>('power off', async (context) => {
  mock.console()

  context.stream = new stream.MockCommandStream()

  const { default: useDrivers } = await import('../../../main/services/drivers')
  const drivers = useDrivers()

  const command = `POWER 000;\r\n`

  context.stream.withSequence().on(Buffer.from(command), () => Buffer.from('Good'))

  await expect(drivers.powerOff(kDriverGuid, 'port:/dev/ttyS0')).resolves.toBeUndefined()
  context.stream.sequence.expectDone()
})

test<MockStreamContext>('activate tie', async (context) => {
  mock.console()

  context.stream = new stream.MockCommandStream()

  const { default: useDrivers } = await import('../../../main/services/drivers')
  const drivers = useDrivers()

  const input = 1
  const output = 202
  const toResp = (n: number) => String(n).padStart(3, '0')
  const command = `OUTPUT${toResp(output)} ${toResp(input)};\r\n`

  context.stream.withSequence().on(Buffer.from(command), () => Buffer.from('Good'))

  await expect(drivers.activate(kDriverGuid, 'port:/dev/ttyS0', input, output, 0)).resolves.toBeUndefined()
  context.stream.sequence.expectDone()
})
