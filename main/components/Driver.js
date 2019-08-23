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
 *     new(config: DriverConfiguration): Driver,
 * }} DriverConstructor
 */

/**
 * @type {Map<string, DriverConstructor>}
 */
const driverRegistry = new Map();

/**
 * Provides information about and means for operating a switchable device.
 *
 * @abstract
 */
export default class Driver {
    /**
     * Registers a new driver.
     *
     * @param {DriverConstructor} driver The driver construct or class
     *
     * @returns {void}
     */
    static register(driver) {
        // TODO: ow validation

        const guid = driver.about().guid;
        if (driverRegistry.has(guid)) {
            throw new ReferenceError(`Driver already to ${guid}`);
        }

        driverRegistry.set(guid, driver);
    }

    /**
     * Loads a driver.
     *
     * @param {string}              guid   The GUID that identifies the driver to be loaded
     * @param {DriverConfiguration} config The configuration for the switchable
     *
     * @returns {Driver}
     */
    static load(guid, config) {
        // TODO: ow validation

        if (!driverRegistry.has(guid)) {
            throw new Error(`No such driver with GUID "${guid}"`);
        }

        const driver = driverRegistry.get(guid);

        // eslint-disable-next-line new-cap
        return new driver(config);
    }

    /**
     * Initializes a new instance of the Driver class
     *
     * @param {DriverConfiguration} config       The device configuration for the driver
     * @param {DriverCapabilities}  capabilities The capabilities of the driver
     */
    constructor(config, capabilities) {
        // TODO: ow validation

        /**
         * @type {DriverConfiguration}
         * @readonly
         */
        this.configuration = config;

        /**
         * @type {DriverCapabilities}
         * @readonly
         */
        this.capabilities = capabilities;

        // Ensure all current properties are read-only.
        Object.freeze(this);
    }

    /**
     * Gets the GUID for the driver.
     *
     * @abstract
     *
     * @returns {string}
     */
    // eslint-disable-next-line class-methods-use-this
    get guid() {
        // Abstract method.
    }

    /**
     * Gets the title of the driver.
     *
     * @abstract
     *
     * @returns {string}
     */
    // eslint-disable-next-line class-methods-use-this
    get title() {
        // Abstract method.
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
     *
     * @returns {void}
     */
    // eslint-disable-next-line class-methods-use-this
    powerOn() {
        // Abstract method.
    }

    /**
     * Powers off the switch or monitor.
     *
     * @abstract
     *
     * @returns {void}
     */
    // eslint-disable-next-line class-methods-use-this
    powerOff() {
        // Abstract method.
    }
}

// Now we register our known drivers.
Driver.register(require("../drivers/TeslaSmartMatrixSwitch"));
Driver.register(require("../drivers/ExtronMatrixSwitch"));
Driver.register(require("../drivers/SonySerialBroadcastMonitor"));
