
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

export function dbusSend(dbus: DBus, bus: string, objPath: string, ifName: string, member: string, ...args: string[]): string {
    return `dbus-send ${dbus} --dest=${bus} ${objPath} ${ifName}.${member} ${args.join(" ")}`;
}

export function signalShutdown(): Promise<void> {
    const cmd = dbusSend(DBus.SYSTEM, "org.freedesktop.login1", "/org/freedesktop/login1",
        "org.freedesktop.login1.Manager", "PowerOff", "boolean:false");
    console.log(cmd);

    return Promise.resolve();
}
