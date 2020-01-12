/*
BridgeCmdr - A/V switch and monitor controller
Copyright (C) 2019-2020 Matthew Holder

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

/*
 * Sony BVM D-series RS-485 Serial Protocol (Current Understanding)
 *
 * This driver is based on the current understanding of the protocol from observation of the remote output.  This may
 * not be entirely correct and will be missing other information.  Since the packet format vaguely mimics the 9-pin
 * protocol, the packet types use those names.
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
    public constructor(message?: string) {
        super(message || "Sony Driver Error");
    }
}

export class PacketError extends SonyDriverError {
    public constructor(message?: string) {
        super(message || "Packet Error");
    }
}

export class ChecksumError extends PacketError {
    public constructor(message?: string) {
        super(message || "Checksum Error");
    }
}

export class CommandBlockError extends SonyDriverError {
    public constructor(message?: string) {
        super(message || "Command Block Error");
    }
}

/** Calculates the checksum for a packet */
function calculateChecksum(data: Buffer): number {
    let x = 0;
    for (const byte of data) {
        x = x + byte;
    }

    x = ~x & 0xFF;
    x = x - (data.byteLength - 1);

    return x;
}

/** Identifies the type of a packet. */
export enum PacketType {
    TRANSPORT_CONTROL = 2, ///< A simple data packet.
}

/** Represents a data packet that encapsulates the command blocks. */
export class Packet {
    public type: PacketType;
    public data: Buffer;

    /**
     * Initializes a new instance of the Packet class.
     *
     * @param type     The type of the packet
     * @param data     The data of the packet
     * @param size     If being parsed, the size of the packet to be confirmed
     * @param checksum If being parsed, the checksum of the packet to be confirmed
     */
    public constructor(type: PacketType, data: Buffer, size = -1, checksum = -1) {
        // If parsing a packet, ensure the size matches.
        if (size >= 0 && size !== data.length) {
            throw new PacketError("Package and data length mismatched");
        }

        if (checksum > 0) {
            const expected = calculateChecksum(data);
            if (expected !== checksum) {
                throw new ChecksumError("Checksum mismatch");
            }
        }

        this.type = type;
        this.data = data;
    }

    // TODO: Node method for parsing this...

    public package(): Buffer {
        const checksum = calculateChecksum(this.data);
        const size     = this.data.byteLength & 0xFF;

        const buffer = Buffer.alloc(3 + size);
        let   pos    = 0;

        buffer.writeUInt8(this.type, pos); pos += 1;
        buffer.writeUInt8(size, pos); pos += 1;
        this.data.copy(buffer, pos); pos += size;
        buffer.writeUInt8(checksum, pos); pos += 1;

        return buffer;
    }
}

/** Identifies the kind of address being used. */
export enum AddressKind {
    ALL     = 0xC0, ///< All monitors are being addressed.
    GROUP   = 0x80, ///< A group of monitors is addressed.
    MONITOR = 0x00, ///< Only a single monitor is addressed.
}

/** Identifies the source or destination of a command block. */
export class Address {
    public kind:    AddressKind;
    public address: number;

    /**
     * Creates a new instance of the Address class.
     *
     * @param kind    The kind of address being specified
     * @param address The address value
     */
    public constructor(kind: AddressKind, address: number) {
        this.kind    = kind;
        this.address = address;
    }

    // TODO: Node method for parsing this...

    /** Creates the raw address value. */
    public package(): number {
        return this.kind | this.address;
    }
}

/** Identifies the command being send or received. */
export enum Command {
    SET_CHANNEL = 0x2100, // Sets the channel
    POWER_ON    = 0x293E, // Powers on the monitor
    POWER_OFF   = 0x2A3E, // Powers off the monitor
    BUTTON      = 0x3F44, // Emits a control module button
}

export class CommandBlock {
    public destination: Address;
    public source:      Address;
    public command:     Command;
    public arg0:        number;
    public arg1:        number;

    /**
     * Initializes a new instance of the CommandBlock class.
     *
     * @param destination The destination address
     * @param source      The source address
     * @param command     The command
     * @param arg0        The first argument of the command, if applicable
     * @param arg1        The second argument of the command, if applicable
     */
    public constructor(destination: Address, source: Address, command: Command, arg0 = -1, arg1 = -1) {
        this.destination = destination;
        this.source      = source;
        this.command     = command;
        this.arg0        = arg0;
        this.arg1        = arg1;
    }

    // TODO: Node method for parsing this...

    public package(): Packet {
        const buffer = Buffer.alloc(6);
        let pos = 0;

        buffer.writeUInt8(this.destination.package(), pos); pos += 1;
        buffer.writeUInt8(this.source.package(), pos); pos += 1;
        buffer.writeUInt16BE(this.command, pos); pos += 2;
        if (this.arg0 >= 0) {
            buffer.writeUInt8(this.arg0, pos); pos += 1;
            if (this.arg1 >= 0) {
                buffer.writeUInt8(this.arg1, pos); pos += 1;
            }
        }

        return new Packet(PacketType.TRANSPORT_CONTROL, buffer.slice(0, pos));
    }
}
