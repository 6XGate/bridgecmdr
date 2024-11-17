import { beforeAll, describe, expect, test } from 'vitest'
import {
  createAddress,
  createCommand,
  createPacket,
  kAddressAll,
  kAddressGroup,
  kAddressMonitor,
  kCommandPacket,
  kPowerOn,
  PacketError,
  SonyDriverError
} from '../../../../main/services/protocols/sonyRs485'
import type { Address } from '../../../../main/services/protocols/sonyRs485'

describe('errors', () => {
  test('SonyDriverError', () => {
    expect(new SonyDriverError().message).toBe('[Sony Driver]: Unknown error')
  })
  test('PacketError', () => {
    expect(new PacketError().message).toBe('[Sony Driver]: Unknown package error')
  })
})

describe('createPackage', () => {
  test('good package', () => {
    expect(createPacket(kCommandPacket, Buffer.alloc(5))).toStrictEqual(
      Buffer.from([0x02, 0x05, 0x0, 0x0, 0x0, 0x0, 0x0, 0xfb])
    )
  })
  test('empty package', () => {
    expect(() => createPacket(kCommandPacket, Buffer.alloc(0))).toThrow(
      new PacketError('Attempting to send empty packet')
    )
  })
  test('oversized package', () => {
    expect(() => createPacket(kCommandPacket, Buffer.alloc(256))).toThrow(
      new PacketError('Packet is too large at 256B')
    )
  })
})

test('createAddress', () => {
  expect(createAddress(kAddressAll, 5)).toBe(0xc5)
  expect(createAddress(kAddressGroup, 5)).toBe(0x85)
  expect(createAddress(kAddressMonitor, 5)).toBe(0x05)
})

describe('createCommand', () => {
  let address: Address
  beforeAll(() => {
    address = createAddress(kAddressAll, 0xf)
  })
  test('no arguments', () => {
    expect(createCommand(address, address, kPowerOn)).toStrictEqual(
      Buffer.from([0x02, 0x04, 0xcf, 0xcf, 0x29, 0x3e, 0xf7])
    )
  })
  test('one argument', () => {
    expect(createCommand(address, address, kPowerOn, 4)).toStrictEqual(
      Buffer.from([0x02, 0x05, 0xcf, 0xcf, 0x29, 0x3e, 0x04, 0xf2])
    )
  })
  test('two arguments', () => {
    expect(createCommand(address, address, kPowerOn, 3, 2)).toStrictEqual(
      Buffer.from([0x02, 0x06, 0xcf, 0xcf, 0x29, 0x3e, 0x03, 0x02, 0xf0])
    )
  })
})
