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

const theRegistry    = Symbol("[[Driver Registry]]");
const myConfig       = Symbol("[[Driver Configuration]]");
const myCapabilities = Symbol("[[Device Capabilities]]");

/**
 * @typedef {{
 *     guid:  string,
 *     title: string,
 * }} DriverDescriptor
 */

/**
 * @typedef {Object.<string, *>} DriverConfiguration
 */

/**
 * @typedef {{
 *     about(): DriverDescriptor,
 *     new(DriverConfiguration): Driver,
 * }} DriverConstructor
 */

/**
 * @typedef {{
 *     guid:  string,
 *     title: string,
 *     ctor:  DriverConstructor
 * }} DriverRegistration
 */

/**
 * Provides information about and means for operating a switchable device.
 *
 * @abstract
 */
export default class Driver {
    /**
     * Registers a new driver.
     *
     * @param {DriverConstructor} driver The driver construct or class.
     *
     * @returns {void}
     */
    static register(driver) {
        /** @type {DriverDescriptor} */
        const about = driver.about();
        /** @type {string} */
        const guid = about.guid;
        /** @type {string} */
        const title = about.title;

        if (Driver[theRegistry].hasOwnProperty(guid)) {
            throw new ReferenceError(`Driver already to ${guid}`);
        }

        Driver[theRegistry][guid] = { guid, title, ctor: driver };
    }

    /**
     * Finds a driver.
     *
     * @param {string}              guid
     * @param {DriverConfiguration} configuration
     *
     * @returns {Driver}
     */
    static load(guid, configuration) {
        if (!Driver[theRegistry].hasOwnProperty(guid)) {
            throw new Error(`No such driver with GUID "${guid}"`);
        }

        /** @type {DriverRegistration} */
        const entry = Driver[theRegistry][guid];

        // eslint-disable-next-line new-cap
        return new entry.ctor(configuration);
    }

    /**
     * Initializes a new instance of the Driver class
     *
     * @param {DriverConfiguration} configuration
     * @param {DriverCapabilities}  capabilities
     */
    constructor(configuration, capabilities) {
        /** @type {DriverConfiguration} */
        this[myConfig]       = configuration;
        /** @type {DriverCapabilities} */
        this[myCapabilities] = capabilities;
    }

    /**
     * Sets input and output ties.
     *
     * @abstract
     *
     * @param {number} inputChannel       The input channel to tie.
     * @param {number} videoOutputChannel The output video channel to tie.
     * @param {number} audioOutputChannel The output audio channel to tie.
     *
     * @returns {void}
     */
    // eslint-disable-next-line class-methods-use-this
    setTie(inputChannel, videoOutputChannel, audioOutputChannel) {
        // Abstract method.
    }

    /**
     * Powers on the switch or monitor.
     *
     * @abstract
     */
    // eslint-disable-next-line class-methods-use-this
    powerOn() {
        // Abstract method.
    }

    /**
     * Powers off the switch or monitor.
     *
     * @abstract
     */
    // eslint-disable-next-line class-methods-use-this
    powerOff() {
        // Abstract method.
    }
}

// Initialize the registry.
/** @type {DriverRegistration} */
Driver[theRegistry] = {};

// Now we register our known drivers.
Driver.register(require("../drivers/TeslaSmartMatrixSwitch").default);
Driver.register(require("../drivers/ExtronMatrixSwitch").default);
Driver.register(require("../drivers/SonySerialBroadcastMonitor").default);
