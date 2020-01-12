import _          from "lodash";
import SerialPort from "serialport";

export interface SerialDevice {
    label: string;
    path:  string;
}

export enum DeviceLocation {
    PATH = 0,
    PORT = 1,
    IP   = 2,
}

export function generateLabel(port: SerialPort.PortInfo): string {
    if (!port.pnpId) {
        return port.comName;
    }

    let labelParts = port.pnpId.split("-");
    if (labelParts.length < 3) {
        return port.comName;
    }

    for (;;) {
        const part = _.last(labelParts) as string;
        if ((/^port\d+$/u).test(part)) {
            labelParts.pop();
        } else if ((/^if\d+$/u).test(part)) {
            labelParts.pop();
        } else {
            break;
        }
    }

    labelParts = _.tail(labelParts);
    if (labelParts.length === 0) {
        return port.comName;
    }

    return labelParts.join("-").replace(/_/gu, " ");
}

export async function makeSerialDeviceList(): Promise<SerialDevice[]> {
    const ports   = await SerialPort.list();
    const devices = [] as SerialDevice[];
    for (const port of ports) {
        const device = {} as SerialDevice;
        if (port.pnpId && port.pnpId.length) {
            // Use the `by-id` path from the PNP-ID.
            device.label = generateLabel(port);
            device.path  = `/dev/serial/by-id/${port.pnpId}`;
        } else {
            // Just use the port path for the label and path.
            device.label = port.comName;
            device.path  = port.comName;
        }

        devices.push(device);
    }

    return devices;
}

export function rebuildPath(location: DeviceLocation, path: string): string {
    if (location === DeviceLocation.IP) {
        return `ip:${path}`;
    }

    if (location === DeviceLocation.PORT) {
        return `port:${path}`;
    }

    return path;
}

export function getLocationFromPath(path: string): DeviceLocation {
    if (path.startsWith("ip:")) {
        return DeviceLocation.IP;
    }

    if (path.startsWith("port:")) {
        return DeviceLocation.PORT;
    }

    return DeviceLocation.PATH;
}

export function getSubPathFromPath(path: string): string {
    if (path.startsWith("ip:")) {
        return path.substr(3);
    }

    if (path.startsWith("port:")) {
        return path.substr(5);
    }

    return path;
}
