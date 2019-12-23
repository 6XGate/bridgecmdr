/*
BridgeCmdr - A/V switch and monitor controller
Copyright (C) 2019 Matthew Holder

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

import stream                                                                  from "stream";
import Driver, { DriverCapabilities, DriverDescriptor }                        from "../support/system/driver";
import { openStream, SerialBits, SerialParity, SerialStopBits, writeToStream } from "../support/stream";
import { Address, AddressKind, Command, CommandBlock }                         from "../support/specialized/sony-bvm-support";

const capabilities = DriverCapabilities.NONE;
const about        = Object.freeze({
    guid:  "8626D6D3-C211-4D21-B5CC-F5E3B50D9FF0",
    title: "Sony RS-485 controllable monitor",
    capabilities,
});

export default class SonySerialMonitor extends Driver {
    private connection: stream.Duplex;

    public static about(): DriverDescriptor {
        return about;
    }

    public static async load(path: string): Promise<Driver> {
        const connection = await openStream(path, {
            baudReat: 38400,
            bits:     SerialBits.EIGHT,
            parity:   SerialParity.ODD,
            stopBits: SerialStopBits.ONE,
        });

        return new SonySerialMonitor(connection);
    }

    // eslint-disable-next-line class-methods-use-this
    public get guid(): string {
        return about.guid;
    }

    // eslint-disable-next-line class-methods-use-this
    public get title(): string {
        return about.title;
    }

    private constructor(connection: stream.Duplex) {
        super(capabilities);
        this.connection = connection;

        // TODO: Other situation handlers...
        connection.on("data", data => console.debug(`DEBUG: ${about.title}: return: ${data}`));
        connection.on("error", error => console.error(`ERROR: ${about.title}: ${error}`));
    }

    public setTie(inputChannel: number): Promise<void> {
        console.log(`Sony BVM: ${inputChannel}`);

        return this.sendCommand(Command.SET_CHANNEL, 1, inputChannel);
    }

    public powerOn(): Promise<void> {
        return this.sendCommand(Command.POWER_ON);
    }

    public powerOff(): Promise<void> {
        return this.sendCommand(Command.POWER_OFF);
    }

    public async unload(): Promise<void> {
        await new Promise((resolve, reject) => {
            this.connection.once("error", error => reject(error));
            this.connection.end(() => resolve());
        });

        this.connection.destroy();
    }

    private sendCommand(command: Command, arg0 = -1, arg1 = -1): Promise<void> {
        const source = new Address(AddressKind.ALL, 0);
        const destination = new Address(AddressKind.ALL, 0);

        const block = new CommandBlock(destination, source, command, arg0, arg1);
        const packet = block.package();

        return writeToStream(this.connection, packet.package());
    }
}
