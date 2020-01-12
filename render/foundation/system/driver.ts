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

import _ from "lodash";

/**
 * Indicates a device's capabilities.
 */
export enum DriverCapabilities {
    /** The device has no extended capabilities. */
    NONE                      = 0,
    /** The device has multiple output channels. */
    HAS_MULTIPLE_OUTPUTS      = 1 << 0,
    /** The device support sending the audio output to a different channel. */
    CAN_DECOUPLE_AUDIO_OUTPUT = 1 << 1,
}

export interface DriverDescriptor {
    guid:         string;
    title:        string;
    capabilities: DriverCapabilities;
}

export interface DriverConstructor {
    about(): DriverDescriptor;
    load(path: string): Promise<Driver>;
}

const driverRegistry = new Map<string, DriverConstructor>();

/**
 * Provides information about and means for operating a switchable device.
 */
export default abstract class Driver {
    /**
     * Gets basic data about all the drivers in the registry.
     */
    static all(): DriverDescriptor[] {
        return _.map(Array.from(driverRegistry.values()), function (entry: DriverConstructor) {
            return entry.about();
        });
    }

    /**
     * Registers a new driver.
     *
     * @param driver The driver construct or class
     */
    static register(driver: DriverConstructor): void {
        // TODO: ow validation

        const guid = String(driver.about().guid).toUpperCase();
        if (driverRegistry.has(guid)) {
            throw new ReferenceError(`Driver already to ${guid}`);
        }

        driverRegistry.set(guid, driver);
    }

    /**
     * Loads a driver.
     *
     * @param guid The GUID that identifies the driver to be loaded
     * @param path The path to the device
     */
    static load(guid: string, path: string): Promise<Driver> {
        // TODO: ow validation

        guid = String(guid).toUpperCase();
        const driver = driverRegistry.get(guid);
        if (driver === undefined) {
            throw new Error(`No such driver with GUID "${guid}"`);
        }

        // eslint-disable-next-line new-cap
        return driver.load(path);
    }

    public readonly capabilities: DriverCapabilities;

    /**
     * Initializes a new instance of the Driver class
     *
     * @param capabilities The capabilities of the driver
     */
    constructor(capabilities: DriverCapabilities) {
        this.capabilities  = capabilities;

        // Ensure all current properties are read-only.
        // Object.freeze(this);
    }

    /**
     * Gets the GUID for the driver.
     */
    abstract get guid(): string;

    /**
     * Gets the title of the driver.
     */
    abstract get title(): string;

    /**
     * Sets input and output ties.
     *
     * @param inputChannel       The input channel to tie.
     * @param videoOutputChannel The output video channel to tie.
     * @param audioOutputChannel The output audio channel to tie.
     */
    // eslint-disable-next-line class-methods-use-this
    abstract setTie(inputChannel: number, videoOutputChannel: number, audioOutputChannel: number): Promise<void>;

    /**
     * Powers on the switch or monitor.
     */
    abstract powerOn(): Promise<void>;

    /**
     * Powers off the switch or monitor.
     */
    abstract powerOff(): Promise<void>;

    /**
     * Closes the device to which the driver is attached.
     */
    abstract unload(): Promise<void>;
}
