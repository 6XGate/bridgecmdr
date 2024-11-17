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

const kDriverGuid = 'BBED08A1-C749-4733-8F2E-96C9B56C0C41'

test('available', async () => {
  const { default: driver } = await import('../../../../main/drivers/shinybow/v3')

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
  const command = `POWER 001;\r\n`

  context.stream.withSequence().on(Buffer.from(command), () => Buffer.from('Good'))

  await expect(drivers.powerOn(kDriverGuid, 'port:/dev/ttyS0')).resolves.toBeUndefined()
  context.stream.sequence.expectDone()
})

test('power off', async () => {
  const command = `POWER 000;\r\n`

  context.stream.withSequence().on(Buffer.from(command), () => Buffer.from('Good'))

  await expect(drivers.powerOff(kDriverGuid, 'port:/dev/ttyS0')).resolves.toBeUndefined()
  context.stream.sequence.expectDone()
})

test('activate tie', async () => {
  const input = 1
  const output = 202
  const toResp = (n: number) => String(n).padStart(3, '0')
  const command = `OUTPUT${toResp(output)} ${toResp(input)};\r\n`

  context.stream.withSequence().on(Buffer.from(command), () => Buffer.from('Good'))

  await expect(drivers.activate(kDriverGuid, 'port:/dev/ttyS0', input, output, 0)).resolves.toBeUndefined()
  context.stream.sequence.expectDone()
})
