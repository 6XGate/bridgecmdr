import _          from "lodash";
import net        from "net";
import stream     from "stream";
import SerialPort from "serialport";

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
}

const defaultOptions: CombinedStreamOptions = Object.freeze({
    baudReat: 9600,
    bits:     SerialBits.EIGHT,
    stopBits: SerialStopBits.ONE,
    parity:   SerialParity.NONE,
});

export function openStream(path: string, options = defaultOptions): Promise<stream.Duplex> {
    options = _.defaults(options, defaultOptions);

    if (path.startsWith("port:")) {
        const serialOptions: SerialPort.OpenOptions = {
            baudRate: options.baudReat,
            dataBits: options.bits,
            stopBits: options.stopBits,
            parity:   options.parity,
        };

        path = path.substr(5);

        return new Promise((resolve, reject) => {
            const port = new SerialPort(path, serialOptions, error => {
                error ? reject(error) : resolve(port);
            });
        });
    }

    if (path.startsWith("ip:")) {
        path = path.substr(3);

        return new Promise((resolve, reject) => {
            const socket = new net.Socket();
            const ctx    = {
                connect: () => { resolve(); ctx.done(); },
                error:   (error: Error) => { reject(error); ctx.done(); },
                done:    () => {
                    socket.removeListener("connect", ctx.connect);
                    socket.removeListener("error", ctx.error);
                },
            };

            socket.once("connect", ctx.connect);
            socket.once("error", ctx.error);

            socket.connect(23, path);
        });
    }

    throw new Error("Not yet supported");
}

export function writeToStream(_stream: stream.Duplex, data: string|Buffer): Promise<void> {
    return new Promise((resolve, reject) => {
        const ctx = {
            then:  () => { resolve(); ctx.done(); },
            error: (error: Error) => { reject(error); ctx.done(); },
            done:  () => { _stream.off("error", ctx.error); },
        };

        _stream.once("error", ctx.error);
        typeof data === "string" ?
            _stream.write(data, "ascii", ctx.then) :
            _stream.write(data, ctx.then);
    });
}
