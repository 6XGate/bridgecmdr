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

const kDriverGuid = '4C8F2838-C91D-431E-84DD-3666D14A6E2C'

test('available', async () => {
  const { default: driver } = await import('../../../main/drivers/extron/sis')
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

  // Power on is a no-op

  context.stream.withSequence()

  await expect(drivers.powerOn(kDriverGuid, 'port:/dev/ttyS0')).resolves.toBeUndefined()
  context.stream.sequence.expectDone()
})

test<MockStreamContext>('power off', async (context) => {
  mock.console()

  context.stream = new stream.MockCommandStream()

  const { default: useDrivers } = await import('../../../main/services/drivers')
  const drivers = useDrivers()

  // Power off is a no-op

  context.stream.withSequence()

  await expect(drivers.powerOff(kDriverGuid, 'port:/dev/ttyS0')).resolves.toBeUndefined()
  context.stream.sequence.expectDone()
})

test<MockStreamContext>('activate tie', async (context) => {
  mock.console()

  context.stream = new stream.MockCommandStream()

  const { default: useDrivers } = await import('../../../main/services/drivers')
  const drivers = useDrivers()

  const input = 1
  const video = 2
  const audio = 3

  const toResp = (n: number) => String(n).padStart(2, '0')

  const command = `${input}*${video}%\r\n${input}*${audio}$\r\n`
  const response = `Out${toResp(video)} In${toResp(input)} Vid\r\nOut${toResp(audio)} In${toResp(input)} Aud\r\n`

  context.stream.withSequence().on(Buffer.from(command, 'ascii'), () => Buffer.from(response))

  await expect(drivers.activate(kDriverGuid, 'port:/dev/ttyS0', input, video, audio)).resolves.toBeUndefined()
  context.stream.sequence.expectDone()
})
