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
