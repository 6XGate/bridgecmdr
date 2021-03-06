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

import Driver, { DriverCapabilities, DriverDescriptor }         from "../driver";
import { openStream, SerialBits, SerialParity, SerialStopBits } from "../../streams/command";

const capabilities = DriverCapabilities.NONE;
const about        = {
    guid:  "91D5BC95-A8E2-4F58-BCAC-A77BA1054D61",
    title: "TeslaSmart-compatible matrix switch",
    capabilities,
};

export default class TeslaSmartMatrixSwitch extends Driver {
    private readonly path: string;

    public static about(): DriverDescriptor {
        return about;
    }

    public static load(path: string): Promise<Driver> {
        return Promise.resolve(new TeslaSmartMatrixSwitch(path));
    }

    // eslint-disable-next-line class-methods-use-this
    public get guid(): string {
        return about.guid;
    }

    // eslint-disable-next-line class-methods-use-this
    public get title(): string {
        return about.title;
    }

    private constructor(path: string) {
        super(capabilities);
        this.path = path;
    }

    public async setTie(inputChannel: number): Promise<void> {
        console.log(`Tesla: ${inputChannel}`);

        const command = Buffer.from(Uint8Array.from([ 0xAA, 0xBB, 0x03, 0x01, inputChannel, 0xEE ]));

        const connection = await openStream(this.path, {
            baudReat: 9600,
            bits:     SerialBits.EIGHT,
            parity:   SerialParity.NONE,
            stopBits: SerialStopBits.ONE,
        });

        // TODO: Other situation handlers...
        connection.on("data", data => console.debug(`DEBUG: ${about.title}: return: ${data}`));
        connection.on("error", error => console.error(`ERROR: ${about.title}: ${error}`));

        await connection.write(command);
        await connection.close();
    }

    // eslint-disable-next-line class-methods-use-this
    public powerOn(): Promise<void> {
        return Promise.resolve();
    }

    // eslint-disable-next-line class-methods-use-this
    public powerOff(): Promise<void> {
        return Promise.resolve();
    }

    // eslint-disable-next-line class-methods-use-this
    public unload(): Promise<void> {
        return Promise.resolve();
    }
}
