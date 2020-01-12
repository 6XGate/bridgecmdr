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

import Driver from "./driver";

const knownSwitches = new Map<string, Switch>();

/**
 * Provides information for and a means to operate a switchable device.
 */
export default class Switch {
    /**
     * Gets all the known switches.
     */
    static all(): Switch[] {
        return Array.from(knownSwitches.values());
    }

    /**
     * Adds a switch to the known switches registry.
     *
     * @param guid   The identifier used when referencing the switchable device
     * @param title  The title to display for the switchable device
     * @param driver The driver for the switchable device
     */
    static add(guid: string, title: string, driver: Driver): Switch {
        // TODO: ow validation

        guid = String(guid).toUpperCase();
        if (knownSwitches.has(guid)) {
            throw new ReferenceError(`Cannot register switch "${title}" to GUID ${guid}, it is already used`);
        }

        const newSwitch = new Switch(guid, title, driver);
        knownSwitches.set(guid, newSwitch);

        return newSwitch;
    }

    /**
     * Unregisters all known switches.
     */
    static clear(): void {
        knownSwitches.clear();
    }

    /**
     * Gets a known switch.
     */
    static find(guid: string): Switch {
        // TODO: ow validation

        guid = String(guid).toUpperCase();
        const $switch = knownSwitches.get(guid);
        if ($switch === undefined) {
            throw new ReferenceError(`No switch is registered for "${guid}"`);
        }

        return $switch;
    }

    public readonly guid: string;

    public readonly title: string;

    public readonly driver: Driver;

    /**
     * Initializes a new instance of the Switch class.
     *
     * @param guid   The identifier used when referencing the switchable device
     * @param title  The title to display for the switchable device
     * @param driver The driver for the switchable device
     */
    constructor(guid: string, title: string, driver: Driver) {
        // TODO: ow validation

        this.guid   = guid;
        this.title  = title;
        this.driver = driver;

        // Ensure all current properties are read-only.
        Object.freeze(this);
    }

    /**
     * Sets input and output ties.
     *
     * @param inputChannel       The input channel of the tie
     * @param videoOutputChannel The output video channel of the tie
     * @param audioOutputChannel The output audio channel of the tie
     */
    setTie(inputChannel: number, videoOutputChannel: number, audioOutputChannel: number): Promise<void> {
        // TODO: ow validation

        return this.driver.setTie(inputChannel, videoOutputChannel, audioOutputChannel);
    }

    /**
     * Powers off the switchable device.
     */
    powerOn(): Promise<void> {
        return this.driver.powerOn();
    }

    /**
     * Powers off the switchable device.
     */
    powerOff(): Promise<void> {
        return this.driver.powerOff();
    }

    /**
     * Unloads the driver for the switch.
     */
    unload(): Promise<void> {
        return this.driver.unload();
    }
}
