import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import type { MockStreamContext } from '../../support/stream.js'

const mock = await vi.hoisted(async () => await import('../../support/mock.js'))
const port = await vi.hoisted(async () => await import('../../support/serial.js'))
const stream = await vi.hoisted(async () => await import('../../support/stream.js'))

beforeEach<MockStreamContext>(async context => {
  vi.mock(import('electron'), mock.electronModule)
  vi.mock(import('electron-log'))
  vi.mock(import('serialport'), port.serialPortModule)
  vi.doMock(import('../../../main/helpers/stream.js'), stream.commandStreamModule(context))
  await mock.bridgeCmdrBasics()
  await port.createMockPorts()
  const { default: useDrivers } = await import('../../../main/system/driver.js')
  const { default: registerDrivers } = await import('../../../main/plugins/drivers.js')
  useDrivers()
  registerDrivers()
})

afterEach(async () => {
  await globalThis.api.freeAllHandles()
  await port.resetMockPorts()
  vi.resetModules()
})

const kDriverGuid = '91D5BC95-A8E2-4F58-BCAC-A77BA1054D61'

test('available', async () => {
  const { kDeviceHasNoExtraCapabilities } = await import('../../../main/system/driver.js')

  // Raw list.
  await expect(globalThis.api.driver.list()).resolves.toContainEqual({
    enable: true,
    guid: kDriverGuid,
    localized: {
      en: {
        title: 'Tesla smart KVM-compatible switch',
        company: 'Tesla Elec Technology Co.,Ltd',
        provider: 'BridgeCmdr contributors'
      }
    },
    capabilities: kDeviceHasNoExtraCapabilities
  })

  // Localized list.
  const { useDrivers } = await import('../../../renderer/system/driver.js')
  const drivers = useDrivers()
  await expect(drivers.all()).resolves.toBeUndefined()
  expect(drivers.items).toContainEqual({
    guid: kDriverGuid,
    title: 'Tesla smart KVM-compatible switch',
    company: 'Tesla Elec Technology Co.,Ltd',
    provider: 'BridgeCmdr contributors',
    capabilities: kDeviceHasNoExtraCapabilities
  })
})

test('connect', async () => {
  const { useDrivers } = await import('../../../renderer/system/driver.js')
  const { load } = useDrivers()

  await expect(load(kDriverGuid, 'port:/dev/ttyS0')).resolves.not.toBeNull()
})

test<MockStreamContext>('power on', async context => {
  mock.console()

  context.stream = new stream.MockCommandStream()

  const { useDrivers } = await import('../../../renderer/system/driver.js')
  const { load } = useDrivers()

  // Power on is a no-op

  context.stream.withSequence()

  const driver = await load(kDriverGuid, 'port:/dev/ttyS0')
  await expect(driver.powerOn()).resolves.toBeUndefined()
  context.stream.sequence.expectDone()
})

test<MockStreamContext>('power off', async context => {
  mock.console()

  context.stream = new stream.MockCommandStream()

  const { useDrivers } = await import('../../../renderer/system/driver.js')
  const { load } = useDrivers()

  // Power off is a no-op

  context.stream.withSequence()

  const driver = await load(kDriverGuid, 'port:/dev/ttyS0')
  await expect(driver.powerOff()).resolves.toBeUndefined()
  context.stream.sequence.expectDone()
})

test<MockStreamContext>('activate tie', async context => {
  mock.console()

  context.stream = new stream.MockCommandStream()

  const { useDrivers } = await import('../../../renderer/system/driver.js')
  const { load } = useDrivers()

  const input = 1
  const command = Buffer.of(0xaa, 0xbb, 0x03, 0x01, input, 0xee)

  context.stream.withSequence().on(Buffer.from(command), () => Buffer.from('Good'))

  const driver = await load(kDriverGuid, 'port:/dev/ttyS0')
  await expect(driver.activate(input, 0, 0)).resolves.toBeUndefined()
  context.stream.sequence.expectDone()
})
