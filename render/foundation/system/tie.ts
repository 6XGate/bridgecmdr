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

import Switch from "./switch";

export interface TieOutput {
    video: number;
    audio: number;
}

/**
 * Represents a routing tie.
 */
export default class Tie {
    public readonly switch: Switch;

    public readonly input: number;

    public readonly output: Readonly<TieOutput>;

    /**
     * Initializes a new instance of the Tie class.
     *
     * @param switchGuid         The switch identifier for error reporting
     * @param inputChannel       The input channel for the tie.
     * @param videoOutputChannel The video output channel for the tie.
     * @param audioOutputChannel The audio output channel for the tie.
     */
    constructor(switchGuid: string, inputChannel: number, videoOutputChannel: number, audioOutputChannel: number) {
        // TODO: ow validation

        this.switch = Switch.find(switchGuid);
        this.input  = inputChannel;
        this.output = Object.freeze({
            video: videoOutputChannel,
            audio: audioOutputChannel,
        });

        Object.freeze(this);
    }
}
