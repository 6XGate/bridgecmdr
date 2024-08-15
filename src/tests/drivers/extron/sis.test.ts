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
  await globalThis.services.freeAllHandles()
  await port.resetMockPorts()
  vi.resetModules()
})

const kDriverGuid = '4C8F2838-C91D-431E-84DD-3666D14A6E2C'

test('available', async () => {
  const { kDeviceSupportsMultipleOutputs, kDeviceCanDecoupleAudioOutput } = await import('../../../main/system/driver')

  // Raw list.
  await expect(globalThis.services.driver.list()).resolves.toContainEqual({
    enable: true,
    guid: kDriverGuid,
    localized: {
      en: {
        title: 'Extron SIS-compatible matrix switch',
        company: 'Extron Electronics',
        provider: 'BridgeCmdr contributors'
      }
    },
    capabilities: kDeviceSupportsMultipleOutputs | kDeviceCanDecoupleAudioOutput
  })

  // Localized list.
  const { useDrivers } = await import('../../../renderer/system/driver')
  const drivers = useDrivers()
  await expect(drivers.all()).resolves.toBeUndefined()
  expect(drivers.items).toContainEqual({
    guid: kDriverGuid,
    title: 'Extron SIS-compatible matrix switch',
    company: 'Extron Electronics',
    provider: 'BridgeCmdr contributors',
    capabilities: kDeviceSupportsMultipleOutputs | kDeviceCanDecoupleAudioOutput
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

  // Power on is a no-op

  context.stream.withSequence()

  const driver = await load(kDriverGuid, 'port:/dev/ttyS0')
  await expect(driver.powerOn()).resolves.toBeUndefined()
  context.stream.sequence.expectDone()
})

test<MockStreamContext>('power off', async (context) => {
  mock.console()

  context.stream = new stream.MockCommandStream()

  const { useDrivers } = await import('../../../renderer/system/driver')
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

  const { useDrivers } = await import('../../../renderer/system/driver')
  const { load } = useDrivers()

  const input = 1
  const video = 2
  const audio = 3

  const toResp = (n: number) => String(n).padStart(2, '0')

  const command = `${input}*${video}%\r\n${input}*${audio}$\r\n`
  const response = `Out${toResp(video)} In${toResp(input)} Vid\r\nOut${toResp(audio)} In${toResp(input)} Aud\r\n`

  context.stream.withSequence().on(Buffer.from(command, 'ascii'), () => Buffer.from(response))

  const driver = await load(kDriverGuid, 'port:/dev/ttyS0')
  await expect(driver.activate(input, video, audio)).resolves.toBeUndefined()
  context.stream.sequence.expectDone()
})
