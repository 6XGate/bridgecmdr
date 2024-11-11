import { afterAll, beforeAll, describe, expect, test, vi } from 'vitest'
import type { PortEntry } from '../../main/services/ports'
import { isIpOrValidPort, isValidLocation } from '@/location'

let ports: PortEntry[]
beforeAll(() => {
  ports = [
    {
      locationId: undefined,
      manufacturer: 'Mock Serial Port',
      path: '/dev/ttyS0',
      pnpId: undefined,
      productId: '8087',
      serialNumber: '1',
      title: 'Mock Serial Port',
      vendorId: '8086'
    }
  ]
})

afterAll(() => {
  vi.restoreAllMocks()
  vi.resetModules()
})

describe('isIpOrValidPort', () => {
  test('port', () => {
    expect(isIpOrValidPort('port:/dev/ttyS0', ports)).toBe(true)
    expect(isIpOrValidPort('port:/dev/ttyS5', ports)).toBe(false)
    expect(isIpOrValidPort('port:', ports)).toBe(false)
    expect(isIpOrValidPort('port', ports)).toBe(false)
  })
  test('ip', () => {
    expect(isIpOrValidPort('ip:example.com', ports)).toBe(true)
    expect(isIpOrValidPort('ip:example', ports)).toBe(true)
    expect(isIpOrValidPort('ip:127.5.0.111', ports)).toBe(true)
    expect(isIpOrValidPort('ip:', ports)).toBe(false)
    expect(isIpOrValidPort('ip', ports)).toBe(false)
  })
  test('random', () => {
    expect(isIpOrValidPort('file:', ports)).toBe(false)
    expect(isIpOrValidPort('', ports)).toBe(false)
  })
})

describe('isValidLocation', () => {
  test('port', () => {
    expect(isValidLocation('port:/dev/ttyS0', ports)).toBe(true)
    expect(isValidLocation('port:/dev/ttyS5', ports)).toBe(false)
    expect(isValidLocation('port:', ports)).toBe(false)
    expect(isValidLocation('port', ports)).toBe(false)
  })
  test('ip', () => {
    expect(isValidLocation('ip:example.com', ports)).toBe(true)
    expect(isValidLocation('ip:example', ports)).toBe(true)
    expect(isValidLocation('ip:127.5.0.111', ports)).toBe(true)
    expect(isValidLocation('ip:127.5.0.4111', ports)).toBe(true) // Host not IP.
    expect(isValidLocation('ip:[2561:1900:4545:0003:0200:F8FF:FE21:67CF]', ports)).toBe(true)
    expect(isValidLocation('ip:[2260:F3A4:32CB:715D:5D11:D837:FC76:12FC]', ports)).toBe(true)
    expect(isValidLocation('ip:[FE80::2045:FAEB:33AF:8374]', ports)).toBe(true)
    expect(isValidLocation('ip:[::2045:FAEB:33AF:8374]', ports)).toBe(true)
    expect(isValidLocation('ip:[FE80:2045:FAEB:33AF::]', ports)).toBe(true)
    expect(isValidLocation('ip:[::11.22.33.44]', ports)).toBe(true)
    expect(isValidLocation('ip:[F:F:F:F:F:F:192.168.0.1]', ports)).toBe(true)
    expect(isValidLocation('ip:[2001:db8::123.123.123.123]', ports)).toBe(true)
    expect(isValidLocation('ip:[2001:db8::123.123.123.123]:55', ports)).toBe(true)
    expect(isValidLocation('ip:[2001:db8::123.123.123.123]:ab', ports)).toBe(false)
    expect(isValidLocation('ip:[::]:59', ports)).toBe(true)
    expect(isValidLocation('ip:[]:59', ports)).toBe(false)
    expect(isValidLocation('ip://', ports)).toBe(false)
    expect(isValidLocation('ip:', ports)).toBe(false)
  })
  test('random', () => {
    expect(isValidLocation('file:', ports)).toBe(false)
    expect(isValidLocation('', ports)).toBe(false)
  })
})
