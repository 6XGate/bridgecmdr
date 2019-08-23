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

import Driver from "./Driver";

/**
 * Provides information for and a means to operate a switchable device.
 */
export default class Switchable {
    static register() { /* TODO */ }
    static load() { /* TODO */ }
    static find(guid) { /* TODO */ }

    /**
     * Initializes a new instance of the Switchable class.
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
    }

    /**
     * Sets input and output ties.
     *
     * @param inputChannel       The input channel of the tie
     * @param videoOutputChannel The output video channel of the tie
     * @param audioOutputChannel The output audio channel of the tie
     *
     * @returns {void}
     */
    setTie(inputChannel, videoOutputChannel, audioOutputChannel) {
        this.driver.setTie(inputChannel, videoOutputChannel, audioOutputChannel);
    }

    /**
     * Powers off the switchable device.
     *
     * @returns {void}
     */
    powerOn() {
        this.driver.powerOn();
    }

    /**
     * Powers off the switchable device.
     *
     * @returns {void}
     */
    powerOff() {
        this.driver.powerOff();
    }
}
