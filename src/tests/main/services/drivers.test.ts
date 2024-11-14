import { afterAll, afterEach, beforeAll, describe, expect, test, vi } from 'vitest'
import useDrivers, {
  defineDriver,
  kDeviceCanDecoupleAudioOutput,
  kDeviceSupportsMultipleOutputs
} from '../../../main/services/drivers'
import type { Driver, DriverInformation } from '../../../main/services/drivers'
import type { UUID } from 'node:crypto'
import type { Mock } from 'vitest'

let badDriverId: UUID
let testDriverId: UUID
let information: DriverInformation
let driver: Driver
let activateSpy: Mock<Driver['activate']>
let powerOffSpy: Mock<Driver['powerOff']>
let powerOnSpy: Mock<Driver['powerOn']>
beforeAll(() => {
  badDriverId = '292709CD-5BB9-44A6-BEF2-B3980276E064'
  testDriverId = '4AACE202-FB07-49C8-B4FE-20C4C6C73788'
  information = {
    enabled: true,
    experimental: false,
    kind: 'switch',
    guid: testDriverId,
    localized: {
      en: {
        title: 'Basic test driver',
        company: 'BridgeCmdr contributors',
        provider: 'BridgeCmdr contributors'
      }
    },
    capabilities: kDeviceSupportsMultipleOutputs | kDeviceCanDecoupleAudioOutput
  }
  activateSpy = vi.fn().mockResolvedValue(undefined).mockName('driver.activate')
  powerOffSpy = vi.fn().mockResolvedValue(undefined).mockName('driver.powerOff')
  powerOnSpy = vi.fn().mockResolvedValue(undefined).mockName('driver.powerOn')
  driver = defineDriver({
    ...information,
    setup: () => ({
      activate: activateSpy,
      powerOff: powerOffSpy,
      powerOn: powerOnSpy
    })
  })
})

afterEach(() => {
  vi.resetAllMocks()
})

afterAll(() => {
  vi.restoreAllMocks()
})

describe('defining a driver', () => {
  test('new driver', () => {
    expect(driver.metadata).toStrictEqual(information)
  })

  test('existing driver', () => {
    const duplicate = defineDriver({
      ...information,
      setup: () => ({
        activate: vi.fn().mockResolvedValue(undefined).mockName('driver.activate'),
        powerOff: vi.fn().mockResolvedValue(undefined).mockName('driver.powerOff'),
        powerOn: vi.fn().mockResolvedValue(undefined).mockName('driver.powerOn')
      })
    })

    expect(driver).toBe(duplicate)
  })

  test('getting driver', async () => {
    const drivers = useDrivers()
    await expect(drivers.get(testDriverId)).resolves.toBe(driver)
    await expect(drivers.get(badDriverId)).resolves.toBe(null)
  })
})

describe('calling drivers', () => {
  test('existing driver', async () => {
    const drivers = useDrivers()
    await expect(drivers.activate(testDriverId, 'ip:uri', 1, 2, 3)).resolves.toBeUndefined()
    expect(activateSpy).toHaveBeenCalledWith('ip:uri', 1, 2, 3)
    await expect(drivers.powerOff(testDriverId, 'ip:uri')).resolves.toBeUndefined()
    expect(powerOffSpy).toHaveBeenCalledWith('ip:uri')
    await expect(drivers.powerOn(testDriverId, 'ip:uri')).resolves.toBeUndefined()
    expect(powerOnSpy).toHaveBeenCalledWith('ip:uri')
  })

  test('bad location', async () => {
    const drivers = useDrivers()
    await expect(drivers.activate(testDriverId, 'badfood', 1, 2, 3)).rejects.toThrow(
      '"badfood" is not a valid location'
    )
    expect(activateSpy).not.toHaveBeenCalled()
    await expect(drivers.powerOff(testDriverId, 'badfood')).rejects.toThrow('"badfood" is not a valid location')
    expect(powerOffSpy).not.toHaveBeenCalled()
    await expect(drivers.powerOn(testDriverId, 'badfood')).rejects.toThrow('"badfood" is not a valid location')
    expect(powerOnSpy).not.toHaveBeenCalled()
  })

  test('non-existing driver', async () => {
    const drivers = useDrivers()
    await expect(drivers.activate(badDriverId, 'ip:uri', 1, 2, 3)).rejects.toThrow(`No such driver: "${badDriverId}"`)
    expect(activateSpy).not.toHaveBeenCalled()
    await expect(drivers.powerOff(badDriverId, 'ip:uri')).rejects.toThrow(`No such driver: "${badDriverId}"`)
    expect(powerOffSpy).not.toHaveBeenCalled()
    await expect(drivers.powerOn(badDriverId, 'ip:uri')).rejects.toThrow(`No such driver: "${badDriverId}"`)
    expect(powerOnSpy).not.toHaveBeenCalled()
  })
})
