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

// import Driver from "./Driver";

/** @type {Map<string, Switch>} */
const knownSwitches = new Map();

/**
 * Provides information for and a means to operate a switchable device.
 */
export default class Switch {
    /**
     * Adds a switch to the known switches registry.
     *
     * @param {string} guid
     * @param {string} title
     * @param {Driver} driver
     *
     * @returns {Switch}
     */
    static add(guid, title, driver) {
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
     *
     * @returns {void}
     */
    static clear() {
        knownSwitches.clear();
    }

    /**
     * Gets a known switch.
     *
     * @param {string} guid
     *
     * @returns {Switch}
     */
    static find(guid) {
        // TODO: ow validation

        guid = String(guid).toUpperCase();
        if (!knownSwitches.has(guid)) {
            throw new ReferenceError(`No switch is registered for "${guid}"`);
        }

        return knownSwitches.get(guid);
    }

    /**
     * Initializes a new instance of the Switch class.
     *
     * @param {string} guid   The identifier used when referencing the switchable device
     * @param {string} title  The title to display for the switchable device
     * @param {Driver} driver The driver for the switchable device
     */
    constructor(guid, title, driver) {
        // TODO: ow validation

        /**
         * @type {string}
         * @readonly
         */
        this.guid = guid;

        /**
         * @type {string}
         * @readonly
         */
        this.title = title;

        /**
         * @type {Driver}
         * @readonly
         */
        this.driver = driver;

        // Ensure all current properties are read-only.
        Object.freeze(this);
    }

    /**
     * Sets input and output ties.
     *
     * @param {number} inputChannel       The input channel of the tie
     * @param {number} videoOutputChannel The output video channel of the tie
     * @param {number} audioOutputChannel The output audio channel of the tie
     *
     * @returns {Promise<void>}
     */
    setTie(inputChannel, videoOutputChannel, audioOutputChannel) {
        // TODO: ow validation

        return this.driver.setTie(inputChannel, videoOutputChannel, audioOutputChannel);
    }

    /**
     * Powers off the switchable device.
     *
     * @returns {Promise<void>}
     */
    powerOn() {
        return this.driver.powerOn();
    }

    /**
     * Powers off the switchable device.
     *
     * @returns {Promise<void>}
     */
    powerOff() {
        return this.driver.powerOff();
    }
}
