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

const capabilities =
    DriverCapabilities.HAS_MULTIPLE_OUTPUTS |
    DriverCapabilities.CAN_DECOUPLE_AUDIO_OUTPUT;
const about = {
    guid:  "4C8F2838-C91D-431E-84DD-3666D14A6E2C",
    title: "Extron SIS-compatible matrix switch",
    capabilities,
};

export default class ExtronMatrixSwitch extends Driver {
    private connection: stream.Duplex;

    public static about(): DriverDescriptor {
        return about;
    }

    public static async load(path: string): Promise<Driver> {
        const connection = await openStream(path, {
            baudReat: 9600,
            bits:     SerialBits.EIGHT,
            parity:   SerialParity.NONE,
            stopBits: SerialStopBits.ONE,
        });

        return Promise.resolve(new ExtronMatrixSwitch(connection));
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
        connection.setEncoding("ascii");

        // TODO: Other situation handlers...
        connection.on("data", data => console.debug(`DEBUG: ${about.title}: return: ${data}`));
        connection.on("error", error => console.error(`ERROR: ${about.title}: ${error}`));
    }

    public setTie(inputChannel: number, videoOutputChannel: number, audioOutputChannel: number): Promise<void> {
        console.log(`Extron SIS: ${inputChannel}, ${videoOutputChannel}, ${audioOutputChannel}`);

        const videoCommand = `${inputChannel}*${videoOutputChannel}%`;
        const audioCommand = `${inputChannel}*${audioOutputChannel}$`;
        const command      = `${videoCommand}\r\n${audioCommand}\r\n`;

        return writeToStream(this.connection, command);
    }

    // eslint-disable-next-line class-methods-use-this
    public powerOn(): Promise<void> {
        return Promise.resolve();
    }

    // eslint-disable-next-line class-methods-use-this
    public powerOff(): Promise<void> {
        return Promise.resolve();
    }

    public unload(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.connection.once("error", error => reject(error));
            this.connection.end(() => resolve());
        });
    }
}
