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

/* eslint-disable @typescript-eslint/no-explicit-any */

import _ from "lodash";
import net from "net";
import stream from "stream";
import SerialPort from "serialport";

export interface CommandStream {
    setEncoding(encoding: string): this;
    write(data: Buffer|string): Promise<void>;
    close(): Promise<void>;
    on(event: "data", listener: (chunk: any) => void): this;
    on(event: "error", listener: (error: Error) => void): this;
    on(event: string|symbol, listener: (...args: any[]) => void): this;
}

abstract class AbstractStream<Stream extends stream.Duplex> implements CommandStream {
    protected connection: Stream;

    protected constructor(connection: Stream) {
        this.connection = connection;
    }

    public setEncoding(encoding: string): this {
        this.connection.setEncoding(encoding);

        return this;
    }

    public on(event: string | symbol, listener: (...args: any[]) => void): this {
        this.connection.on(event, listener);

        return this;
    }

    public write(data: string|Buffer): Promise<void> {
        return new Promise((resolve, reject) => {
            const ctx = {
                then:  () => { resolve(); ctx.done(); },
                error: (error: Error) => { reject(error); ctx.done(); },
                done:  () => { this.connection.off("error", ctx.error); },
            };

            this.connection.once("error", ctx.error);
            typeof data === "string" ?
                this.connection.write(data, "ascii", ctx.then) :
                this.connection.write(data, ctx.then);
        });
    }

    public abstract close(): Promise<void>;
}

class SerialStream extends AbstractStream<SerialPort> {
    public constructor(connection: SerialPort) {
        super(connection);
    }

    public async close(): Promise<void> {
        await new Promise((resolve, reject) => {
            this.connection.close(error => { error ? reject(error) : resolve(); });
        });

        this.connection.destroy();
    }
}

class NetStream extends AbstractStream<net.Socket> {
    public constructor(connection: net.Socket) {
        super(connection);
    }

    public async close(): Promise<void> {
        await new Promise((resolve, reject) => {
            this.connection.once("error", error => reject(error));
            this.connection.end(() => resolve());
        });

        this.connection.destroy();
    }
}

export enum SerialBits {
    FIVE  = 5,
    SIX   = 6,
    SEVEN = 7,
    EIGHT = 8,
}

export enum SerialStopBits {
    ONE = 1,
    TWO = 2,
}

export enum SerialParity {
    NONE  = "none",
    EVEN  = "even",
    MARK  = "mark",
    ODD   = "odd",
    SPACE = "space",
}

export interface CombinedStreamOptions {
    baudReat?: number;
    bits?:     SerialBits;
    stopBits?: SerialStopBits;
    parity?:   SerialParity;
    port?:     number;
}

const defaultOptions: CombinedStreamOptions = Object.freeze({
    baudReat: 9600,
    bits:     SerialBits.EIGHT,
    stopBits: SerialStopBits.ONE,
    parity:   SerialParity.NONE,
    port:     23,
});

export function openStream(path: string, options = defaultOptions): Promise<CommandStream> {
    options = _.defaults(options, defaultOptions);

    if (path.startsWith("port:")) {
        const serialOptions: SerialPort.OpenOptions = {
            baudRate: options.baudReat,
            dataBits: options.bits,
            stopBits: options.stopBits,
            parity:   options.parity,
            lock:     false,
        };

        path = path.substr(5);

        return new Promise((resolve, reject) => {
            const port = new SerialPort(path, serialOptions, error => {
                error ? reject(error) : resolve(new SerialStream(port));
            });
        });
    }

    if (path.startsWith("ip:")) {
        path = path.substr(3);

        return new Promise((resolve, reject) => {
            const socket = new net.Socket();
            const ctx    = {
                connect: () => { resolve(new NetStream(socket)); ctx.done(); },
                error:   (error: Error) => { reject(error); ctx.done(); },
                done:    () => {
                    socket.removeListener("connect", ctx.connect);
                    socket.removeListener("error", ctx.error);
                },
            };

            socket.once("connect", ctx.connect);
            socket.once("error", ctx.error);

            socket.connect(options.port || 23, path);
        });
    }

    throw new Error("Not yet supported");
}
