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
  const { default: useDrivers } = await import('../../../main/services/driver')
  const { default: registerDrivers } = await import('../../../main/plugins/drivers')
  useDrivers()
  registerDrivers()
})

afterEach(async () => {
  await globalThis.services.freeAllHandles()
  await port.resetMockPorts()
  vi.resetModules()
})

const kDriverGuid = '671824ED-0BC4-43A6-85CC-4877890A7722'

test('available', async () => {
  const { kDeviceSupportsMultipleOutputs } = await import('../../../main/services/driver')

  // Raw list.
  await expect(globalThis.services.driver.list()).resolves.toContainEqual({
    enable: true,
    guid: kDriverGuid,
    localized: {
      en: {
        title: 'Tesla smart matrix-compatible switch',
        company: 'Tesla Elec Technology Co.,Ltd',
        provider: 'BridgeCmdr contributors'
      }
    },
    capabilities: kDeviceSupportsMultipleOutputs
  })

  // Localized list.
  const { useDrivers } = await import('../../../renderer/services/driver')
  const drivers = useDrivers()
  await expect(drivers.all()).resolves.toBeUndefined()
  expect(drivers.items).toContainEqual({
    guid: kDriverGuid,
    title: 'Tesla smart matrix-compatible switch',
    company: 'Tesla Elec Technology Co.,Ltd',
    provider: 'BridgeCmdr contributors',
    capabilities: kDeviceSupportsMultipleOutputs
  })
})

test('connect', async () => {
  const { useDrivers } = await import('../../../renderer/services/driver')
  const { load } = useDrivers()

  await expect(load(kDriverGuid, 'port:/dev/ttyS0')).resolves.not.toBeNull()
})

test<MockStreamContext>('power on', async (context) => {
  mock.console()

  context.stream = new stream.MockCommandStream()

  const { useDrivers } = await import('../../../renderer/services/driver')
  const { load } = useDrivers()

  // Power on is a no-op

  context.stream.withSequence()

  const driver = await load(kDriverGuid, 'port:/dev/ttyS0')
  await expect(driver.powerOn()).resolves.toBeUndefined()
  context.stream.sequence.expectDone()
})

test<MockStreamContext>('power off', async (context) => {
  mock.console()

  context.stream = new stream.MockCommandStream()

  const { useDrivers } = await import('../../../renderer/services/driver')
  const { load } = useDrivers()

  // Power off is a no-op

  context.stream.withSequence()

  const driver = await load(kDriverGuid, 'port:/dev/ttyS0')
  await expect(driver.powerOff()).resolves.toBeUndefined()
  context.stream.sequence.expectDone()
})

test<MockStreamContext>('activate tie', async (context) => {
  mock.console()

  context.stream = new stream.MockCommandStream()

  const { useDrivers } = await import('../../../renderer/services/driver')
  const { load } = useDrivers()

  const input = 1
  const output = 2

  const toResp = (n: number) => String(n).padStart(2, '0')
  const command = `MT00SW${toResp(input)}${toResp(output)}NT`

  context.stream.withSequence().on(Buffer.from(command, 'ascii'), () => Buffer.from('Good'))

  const driver = await load(kDriverGuid, 'port:/dev/ttyS0')
  await expect(driver.activate(input, output, 0)).resolves.toBeUndefined()
  context.stream.sequence.expectDone()
})
