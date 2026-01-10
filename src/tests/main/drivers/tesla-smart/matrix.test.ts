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

const kDriverGuid = '671824ED-0BC4-43A6-85CC-4877890A7722'

test('available', async () => {
  const { default: driver } = await import('../../../../main/drivers/tesla-smart/matrix')

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
  context.stream.withSequence()

  await expect(drivers.powerOn(kDriverGuid, 'port:/dev/ttyS0')).resolves.toBeUndefined()
  context.stream.sequence.expectDone()
})

test('power off', async () => {
  context.stream.withSequence()

  await expect(drivers.powerOff(kDriverGuid, 'port:/dev/ttyS0')).resolves.toBeUndefined()
  context.stream.sequence.expectDone()
})

test('activate tie', async () => {
  const input = 1
  const output = 2

  const toResp = (n: number) => String(n).padStart(2, '0')
  const command = `MT00SW${toResp(input)}${toResp(output)}NT\r\n`

  context.stream.withSequence().on(Buffer.from(command, 'ascii'), () => Buffer.from('Good'))

  await expect(drivers.activate(kDriverGuid, 'port:/dev/ttyS0', input, output, 0)).resolves.toBeUndefined()
  context.stream.sequence.expectDone()
})
