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
 * - Byte 1:      Packet type
 * - Byte 2:      Packet size (N)
 * - Byte 3..N-1: Packet data (D)
 * - Byte 3+N:    Packet checksum; ~(sum(D)) - (N - 1)
 *
 * Packet Type
 * - 2: Command package
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
  constructor(message?: string) {
    super(`[Sony Driver]: ${message ?? 'Unknown error'}`)
  }
}

export class PacketError extends SonyDriverError {
  constructor(message?: string) {
    super(message ?? 'Unknown package error')
  }
}

/** Calculates the checksum for a packet. */
export function calculateChecksum(data: Buffer) {
  let x = 0n
  for (const byte of data) {
    x = x + BigInt(byte)
  }

  x = ~x & 0xffn
  x = x - (BigInt(data.byteLength) - 1n)

  return Number(x)
}

export type PacketType = z.infer<typeof PacketType>
export const PacketType = z.number().int().brand('PacketType')

/** Identifies a command packet. */
export const kCommandPacket = PacketType.parse(0x2)

export type Package = z.infer<typeof Package>
export const Package = z.instanceof(Buffer).brand('Packet')

/** Create a packet. */
export function createPacket(type: PacketType, data: Buffer) {
  if (data.byteLength === 0) {
    throw new PacketError('Attempting to send empty packet')
  }

  if (data.byteLength > 0xff) {
    throw new PacketError(`Packet is too large at ${data.byteLength}B`)
  }

  const checksum = calculateChecksum(data)
  const buffer = Buffer.alloc(3 + data.byteLength)
  let pos = 0

  buffer.writeUInt8(type, pos)
  pos += 1
  buffer.writeUInt8(data.byteLength, pos)
  pos += 1
  data.copy(buffer, pos)
  pos += data.byteLength
  buffer.writeUInt8(checksum, pos)
  pos += 1

  return Package.parse(buffer.subarray(0, pos))
}

export type AddressKind = z.infer<typeof AddressKind>
export const AddressKind = z.number().int().brand('AddressKind')

/** Identifier all devices are being addressed. */
export const kAddressAll = AddressKind.parse(0xc0)
/** Identifier a group of monitors are being addressed. */
export const kAddressGroup = AddressKind.parse(0x80)
/** Identifier a single monitor are being addressed. */
export const kAddressMonitor = AddressKind.parse(0x00)

export type AddressNumber = z.infer<typeof AddressNumber>
export const AddressNumber = z.number().int().min(0).max(0x1f)

export type Address = z.infer<typeof Address>
export const Address = z.number().int().min(0).max(0xff).brand('Address')

export function createAddress(kind: AddressKind, address: AddressNumber) {
  return Address.parse(kind | AddressNumber.parse(address))
}

export type Command = z.infer<typeof Command>
export const Command = z.number().int().brand('Command')

export const kSetChannel = Command.parse(0x2100)
export const kPowerOn = Command.parse(0x293e)
export const kPowerOff = Command.parse(0x2a3e)
export const kPressButton = Command.parse(0x3f44)

export type CommandArg = z.infer<typeof CommandArg>
export const CommandArg = z.number().int().min(0).max(0xff)

export function createCommand(
  destination: Address,
  source: Address,
  command: Command,
  arg0?: CommandArg,
  arg1?: CommandArg
) {
  arg0 = CommandArg.optional().parse(arg0)
  arg1 = CommandArg.optional().parse(arg1)

  const buffer = Buffer.alloc(6, 0)
  let pos = 0

  buffer.writeUInt8(destination, pos)
  pos += 1
  buffer.writeUInt8(source, pos)
  pos += 1
  buffer.writeUInt16BE(command, pos)
  pos += 2
  if (arg0 == null || arg0 === 0) {
    return createPacket(kCommandPacket, buffer.subarray(0, pos))
  }

  buffer.writeUInt8(arg0, pos)
  pos += 1
  if (arg1 == null || arg1 === 0) {
    return createPacket(kCommandPacket, buffer.subarray(0, pos))
  }

  buffer.writeUInt8(arg1, pos)
  pos += 1

  return createPacket(kCommandPacket, buffer.subarray(0, pos))
}
