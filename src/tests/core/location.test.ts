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
    expect(isIpOrValidPort('port:/dev/ttyS0', ports)).toBeTruthy()
    expect(isIpOrValidPort('port:/dev/ttyS5', ports)).toBeFalsy()
    expect(isIpOrValidPort('port:', ports)).toBeFalsy()
    expect(isIpOrValidPort('port', ports)).toBeFalsy()
  })
  test('ip', () => {
    expect(isIpOrValidPort('ip:example.com', ports)).toBeTruthy()
    expect(isIpOrValidPort('ip:example', ports)).toBeTruthy()
    expect(isIpOrValidPort('ip:127.5.0.111', ports)).toBeTruthy()
    expect(isIpOrValidPort('ip:', ports)).toBeFalsy()
    expect(isIpOrValidPort('ip', ports)).toBeFalsy()
  })
  test('random', () => {
    expect(isIpOrValidPort('file:', ports)).toBeFalsy()
    expect(isIpOrValidPort('', ports)).toBeFalsy()
  })
})

describe('isValidLocation', () => {
  test('port', () => {
    expect(isValidLocation('port:/dev/ttyS0', ports)).toBeTruthy()
    expect(isValidLocation('port:/dev/ttyS5', ports)).toBeFalsy()
    expect(isValidLocation('port:', ports)).toBeFalsy()
    expect(isValidLocation('port', ports)).toBeFalsy()
  })
  test('ip', () => {
    expect(isValidLocation('ip:example.com', ports)).toBeTruthy()
    expect(isValidLocation('ip:example', ports)).toBeTruthy()
    expect(isValidLocation('ip:127.5.0.111', ports)).toBeTruthy()
    expect(isValidLocation('ip:127.5.0.4111', ports)).toBeTruthy() // Host not IP.
    expect(isValidLocation('ip:[2561:1900:4545:0003:0200:F8FF:FE21:67CF]', ports)).toBeTruthy()
    expect(isValidLocation('ip:[2260:F3A4:32CB:715D:5D11:D837:FC76:12FC]', ports)).toBeTruthy()
    expect(isValidLocation('ip:[FE80::2045:FAEB:33AF:8374]', ports)).toBeTruthy()
    expect(isValidLocation('ip:[::2045:FAEB:33AF:8374]', ports)).toBeTruthy()
    expect(isValidLocation('ip:[FE80:2045:FAEB:33AF::]', ports)).toBeTruthy()
    expect(isValidLocation('ip:[::11.22.33.44]', ports)).toBeTruthy()
    expect(isValidLocation('ip:[F:F:F:F:F:F:192.168.0.1]', ports)).toBeTruthy()
    expect(isValidLocation('ip:[2001:db8::123.123.123.123]', ports)).toBeTruthy()
    expect(isValidLocation('ip:[2001:db8::123.123.123.123]:55', ports)).toBeTruthy()
    expect(isValidLocation('ip:[2001:db8::123.123.123.123]:ab', ports)).toBeFalsy()
    expect(isValidLocation('ip:[::]:59', ports)).toBeTruthy()
    expect(isValidLocation('ip:[]:59', ports)).toBeFalsy()
    expect(isValidLocation('ip://', ports)).toBeFalsy()
    expect(isValidLocation('ip:', ports)).toBeFalsy()
  })
  test('random', () => {
    expect(isValidLocation('file:', ports)).toBeFalsy()
    expect(isValidLocation('', ports)).toBeFalsy()
  })
})
