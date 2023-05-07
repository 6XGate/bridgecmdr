import { Buffer } from 'node:buffer'
import { z } from 'zod'

/*
 * Sony BVM D-series RS-485 Serial Protocol (Current Understanding)
 *
 * This driver is based on the current understanding of the protocol from observation of the remote output.  This may
 * not be entirely correct and will be missing other information.  Since the packet format vaguely mimics the 9-pin
 * protocol, the packet @types use those names.
 *
 * Packet Format
 * - Byte 1:        Packet type
 * - Byte 2:        Packet size (N)
 * - Byte 3 to N-1: Packet data (D)
 * - Byte 3+N:      Packet checksum; ~(sum(D)) - (N - 1)
 *
 * Command-block Format
 * - Byte 1:    Destination address
 * - Byte 2:    Source address
 * - Byte 3..4: Command
 * - Byte 5:    Arg zero
 * - Byte 6:    Arg one
 *
 * Address Format
 * - Bits 7..5: Address kind
 *   - C - All connected monitors, the address number should be zero.
 *   - 8 - A monitor group, the address number should be the group number.
 *   - 0 - A single monitor, the address number should be the monitor number.
 * - Bits 4..0: Address number
 */

export class SonyDriverError extends Error {
  constructor (message?: string) {
    super(`[Sony Driver]: ${message ?? 'Unknown error'}`)
  }
}

export class PacketError extends SonyDriverError {
  constructor (message?: string) {
    super(message ?? 'Unknown package error')
  }
}

export class ChecksumError extends PacketError {
  constructor (message?: string) {
    super(message ?? 'Unknown checksum error')
  }
}

export class CommandBlockError extends SonyDriverError {
  constructor (message?: string) {
    super(message ?? 'Unknown command block error')
  }
}

export function calculateChecksum (data: Buffer) {
  let x = 0n
  for (const byte of data) {
    x = x + BigInt(byte)
  }

  x = ~x & 0xffn
  x = x - BigInt(data.byteLength - 1)

  return Number(x)
}

export type PacketType = z.infer<typeof PacketType>
export const PacketType = z.number().int().brand('PacketType')

export const kCommandPacket = PacketType.parse(0x2)

export type Package = z.infer<typeof Package>
export const Package = z.instanceof(Buffer).brand('Packet')

export function createPacket (type: PacketType, data: Buffer) {
  if (data.byteLength === 0) {
    throw new PacketError('Attempting to send empty packet')
  }

  if (data.byteLength > 0xFF) {
    throw new PacketError(`Packet is too large at ${data.byteLength}B`)
  }

  const checksum = calculateChecksum(data)
  const buffer = Buffer.alloc(3 + data.byteLength)
  let pos = 3

  buffer.writeUint8(type, pos); pos += 1
  buffer.writeUint8(data.byteLength, pos); pos += 1
  data.copy(buffer, pos); pos += data.byteLength
  buffer.writeUint8(checksum, pos)

  return Package.parse(buffer)
}

export type AddressKind = z.infer<typeof AddressKind>
export const AddressKind = z.number().int().brand('AddressKind')

export const kAddressAllMonitors = AddressKind.parse(0xC0)
export const kAddressGroup = AddressKind.parse(0x80)
export const kAddressMonitor = AddressKind.parse(0x00)

export type AddressNumber = z.infer<typeof AddressNumber>
export const AddressNumber = z.number().int().min(0).max(0xF)

export type Address = z.infer<typeof Address>
export const Address = z.number().int().min(0).max(0xFF).brand('Address')

export function createAddress (kind: AddressKind, address: AddressNumber) {
  return Address.parse(kind | AddressNumber.parse(address))
}

export type Command = z.infer<typeof Command>
export const Command = z.number().int().brand('Command')

export const kSetChannel = Command.parse(0x2100)
export const kPowerOn = Command.parse(0x293E)
export const kPowerOff = Command.parse(0x2A3E)
export const kPressButton = Command.parse(0x3F44)

export type CommandArg = z.infer<typeof CommandArg>
export const CommandArg = z.number().int().min(0).max(0xFF)

export function createCommand (destination: Address, source: Address, command: Command, arg0?: CommandArg, arg1?: CommandArg) {
  arg0 = CommandArg.optional().parse(arg0)
  arg1 = CommandArg.optional().parse(arg1)

  const buffer = Buffer.alloc(6, 0)
  let pos = 0

  buffer.writeUInt8(destination, pos); pos += 1
  buffer.writeUInt8(source, pos); pos += 1
  buffer.writeUInt16BE(command, pos); pos += 2
  if (arg0 == null) {
    return createPacket(kCommandPacket, buffer.subarray(0, pos))
  }

  buffer.writeUInt8(arg0, pos); pos += 1
  if (arg1 == null) {
    return createPacket(kCommandPacket, buffer.subarray(0, pos))
  }

  buffer.writeUInt8(arg1, pos); pos += 1

  return createPacket(kCommandPacket, buffer.subarray(0, pos))
}
