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

import subprocess from "child_process";

export function toDataUrl(blob: Blob): Promise<string> {
    return new Promise<string>(function (resolve, reject): void {
        const reader = new FileReader();
        reader.onload  = () => resolve(reader.result as string);
        reader.onerror = () => reject(reader.error ? reader.error as Error : new Error("unknown error"));
        reader.readAsDataURL(blob);
    });
}

export enum DBus {
    SYSTEM  = "--system",
    SESSION = "--session",
}

export function dbusSend(dbus: DBus, bus: string, objPath: string, ifName: string, member: string, ...args: string[]): Promise<void> {
    return new Promise((resolve, reject) => {
        const cmd   = `dbus-send ${dbus} --print-reply --dest=${bus} ${objPath} ${ifName}.${member} ${args.join(" ")}`;
        const child = subprocess.exec(cmd, (error, stdout, stderr) => {
            stdout && console.log(stdout);
            stderr && console.error(stderr);

            error ? reject(error) : resolve();
        });

        child.unref();
    });
}

export function signalShutdown(): Promise<void> {
    return dbusSend(DBus.SYSTEM, "org.freedesktop.login1", "/org/freedesktop/login1",
        "org.freedesktop.login1.Manager", "PowerOff", "boolean:false");
}
