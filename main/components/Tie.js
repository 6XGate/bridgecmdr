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

import Switchable from "./Switchable";

/**
 * @typedef {{
 *     video: number,
 *     audio: number,
 * }} TieOutput
 */

/**
 * Represents a routing tie.
 */
export default class Tie {
    /**
     * Initializes a new instance of the Tie class.
     *
     * @param {string} switchGuid         The switch identifier for error reporting
     * @param {number} inputChannel       The input channel for the tie.
     * @param {number} videoOutputChannel The video output channel for the tie.
     * @param {number} audioOutputChannel The audio output channel for the tie.
     */
    constructor(switchGuid, inputChannel, videoOutputChannel, audioOutputChannel) {
        // TODO: ow validation

        /** @type {Switchable} */
        this.switch = Switchable.find(switchGuid);
        /** @type {number} */
        this.input  = inputChannel;
        /** @type {TieOutput} */
        this.output = Object.freeze({
            video: videoOutputChannel,
            audio: audioOutputChannel,
        });

        Object.freeze(this);
    }
}
